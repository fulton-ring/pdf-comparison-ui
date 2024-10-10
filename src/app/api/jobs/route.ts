import { type NextRequest, NextResponse } from "next/server";
import { invokeCeleryTask } from "~/server/celery";
import { db } from "~/server/db";
import { JobSchema, SubmitJobSchema } from "~/model/job";

export async function POST(req: NextRequest) {
  let parsedReq;

  try {
    parsedReq = SubmitJobSchema.safeParse(await req.json());

    if (!parsedReq.success) {
      const { errors } = parsedReq.error;

      return NextResponse.json({
        error: { message: "Invalid request", errors },
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json({
      error: { message: "Invalid JSON in request body" },
    }, { status: 400 });
  }

  try {
    const { outputFormat, uploadId } = parsedReq.data;

    // create job in database
    const job = await db.job.create({
      data: {
        status: "pending",
        output_format: outputFormat,
        upload_id: uploadId,
      },
    });

    // call celery worker
    invokeCeleryTask("worker.app.process_pdf", [job.id]);

    // return parsing job
    return NextResponse.json(JobSchema.parse({
      id: job.id,
      status: job.status,
      outputFormat: job.output_format,
      uploadId: job.upload_id,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    }));
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      error: { message: "Internal server error" },
    }, { status: 500 });
  }
}

// TODO: route to update status (only called by worker)
// TODO: route to get parsed document (only called by frontend)
