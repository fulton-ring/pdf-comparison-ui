import { NextResponse, type NextRequest } from "next/server";
import * as jose from "jose";

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
        .storage.from("jobs")
        .createSignedUrl(
          `jobs/${job.id}/${job.id}.${job.output_format}?t=${Date.now()}`,
          60,
        );

      console.log(
        "created job presigned URL:",
        data,
        Date.now().toLocaleString(),
      );

      if (error) {
        console.error("Error fetching presigned URL for job output:", error);
        throw error;
      }

      outputUrl = data.signedUrl;
    }

    // Decode token in URL and get exp
    let expiration: number | undefined;

    if (outputUrl) {
      const url = new URL(outputUrl);
      const token = url.searchParams.get("token");

      if (!token) {
        throw new Error("Token not found");
      }

      const { exp } = jose.decodeJwt(token);

      if (!exp) {
        throw new Error("Expiration not found");
      }

      expiration = exp;
    }

    const parsedJob = JobDocumentSchema.parse({
      signedUrl: outputUrl,
      exp: expiration,
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
