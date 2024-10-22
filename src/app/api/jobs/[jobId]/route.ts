import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { JobSchema, UpdateJobSchema } from "~/model/job";
import { db } from "~/server/db";
import { getBackendSupabase } from "~/server/supabase";

interface JobIdParams {
  jobId: string;
}

export const GET = async (
  request: NextRequest,
  { params }: { params: JobIdParams },
) => {
  const jobId = params.jobId;

  try {
    const job = await db.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    let outputUrl: string | undefined;

    if (job.status === "completed") {
      const { data, error } = await getBackendSupabase()
        .storage.from(env.SUPABASE_JOBS_BUCKET)
        .createSignedUrl(`jobs/${job.id}/${job.id}.${job.output_format}`, 60);

      if (error) {
        console.error("Error fetching presigned URL for job output:", error);
        throw error;
      }

      outputUrl = data.signedUrl;
    }

    const parsedJob = JobSchema.parse({
      id: job.id,
      status: job.status,
      outputFormat: job.output_format,
      uploadId: job.upload_id,
      outputUrl,
      createdAt: job.created_at.toISOString(),
      updatedAt: job.updated_at.toISOString(),
    });

    return NextResponse.json(parsedJob);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: JobIdParams },
) => {
  const jobId = params.jobId;
  let parsedReq;

  // TODO: generic parsing method
  try {
    console.log("req:", request.body);
    parsedReq = UpdateJobSchema.safeParse(await request.json());

    if (!parsedReq.success) {
      const { errors } = parsedReq.error;

      return NextResponse.json(
        {
          error: { message: "Invalid request", errors },
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json(
      {
        error: { message: "Invalid JSON in request body" },
      },
      { status: 400 },
    );
  }

  try {
    const { status } = parsedReq.data;
    const channel = getBackendSupabase().channel(jobId);

    const job = await db.job.update({ where: { id: jobId }, data: { status } });
    const broadcastResponse = await channel.send({
      type: "broadcast",
      event: "status",
      payload: { status },
    });

    if (broadcastResponse !== "ok") {
      console.error("Error sending status update:", broadcastResponse);
    }

    // TODO: generic conversion methods
    const parsedJob = JobSchema.parse({
      id: job.id,
      status: job.status,
      outputFormat: job.output_format,
      uploadId: job.upload_id,
      createdAt: job.created_at.toISOString(),
      updatedAt: job.updated_at.toISOString(),
    });

    return NextResponse.json(parsedJob);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
