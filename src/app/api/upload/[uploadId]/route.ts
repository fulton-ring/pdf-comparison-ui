import { type NextRequest } from "next/server";
import { env } from "~/env";
import { UploadSchema } from "~/model/upload";
import { db } from "~/server/db";
import { backendSupabase } from "~/server/supabase";

interface UploadIdParams {
  uploadId: string;
}

export const GET = async (req: NextRequest, { params }: { params: UploadIdParams }) => {
  const uploadId = params.uploadId;

  try {
    const upload = await db.upload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      return new Response(JSON.stringify({ error: 'Upload not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // TODO: get presigned URL for upload
    const { data, error } = await backendSupabase
      .storage
      .from(env.NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET)
      .createSignedUrl(upload.filename, 60);

    if (error) {
      console.error("Error fetching presigned URL:", error);
      throw error;
    }

    const uploadWithSignedUrl = UploadSchema.parse({
      id: upload.id,
      filename: upload.filename,
      size: upload.size,
      type: upload.type,
      createdAt: upload.created_at.toISOString(),
      signedUrl: data.signedUrl,
    });

    return new Response(JSON.stringify(uploadWithSignedUrl), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching upload:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
