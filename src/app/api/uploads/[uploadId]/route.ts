import { type NextRequest } from "next/server";
import { UploadSchema } from "~/model/upload";
import { db } from "~/server/db";

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

    const uploadWithSignedUrl = UploadSchema.parse({
      id: upload.id,
      filename: upload.filename,
      size: upload.size,
      type: upload.type,
      createdAt: upload.created_at.toISOString(),
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
