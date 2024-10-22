import { type NextRequest } from "next/server";
import * as jose from "jose";

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

    // Decode token in URL and get exp
    let expiration: number | undefined;

    if (data.signedUrl) {
      const url = new URL(data.signedUrl);
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

    const uploadWithSignedUrl = UploadDocumentSchema.parse({
      signedUrl: data.signedUrl,
      exp: expiration,
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
