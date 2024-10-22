import { type NextRequest } from "next/server";
import { env } from "~/env";
import { UploadDocumentSchema } from "~/model/upload";
import { db } from "~/server/db";
import { getBackendSupabase } from "~/server/supabase";

interface UploadIdParams {
  uploadId: string;
}

export const GET = async (
  req: NextRequest,
  { params }: { params: UploadIdParams },
) => {
  const uploadId = params.uploadId;

  try {
    const upload = await db.upload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      return new Response(JSON.stringify({ error: "Upload not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data, error } = await getBackendSupabase()
      .storage.from("uploads")
      .createSignedUrl(upload.filename, 60);

    if (error) {
      console.error("Error fetching presigned URL:", error);
      throw error;
    }

    const uploadWithSignedUrl = UploadDocumentSchema.parse({
      signedUrl: data.signedUrl,
    });

    return new Response(JSON.stringify(uploadWithSignedUrl), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching upload:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
