import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { JobDocumentSchema } from "~/model/job";
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

    // TODO: option to retrieve sub pages of the document
    let outputUrl: string | undefined;

    if (job.status === "completed") {
      const { data, error } = await getBackendSupabase()
        .storage.from(env.NEXT_PUBLIC_SUPABASE_JOB_BUCKET)
        .createSignedUrl(`jobs/${job.id}/${job.id}.${job.output_format}`, 60);

      if (error) {
        console.error("Error fetching presigned URL for job output:", error);
        throw error;
      }

      outputUrl = data.signedUrl;
    }

    const parsedJob = JobDocumentSchema.parse({
      signedUrl: outputUrl,
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
