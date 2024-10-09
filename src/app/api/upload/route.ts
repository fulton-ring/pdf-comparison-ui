import { type NextRequest, NextResponse } from "next/server";

import { env } from "~/env";
import { UploadRequestSchema } from "~/model/upload";
import { backendSupabase } from "~/server/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = UploadRequestSchema.parse(await req.json());

    const { filename } = body;

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 },
      );
    }

    const bucketName = env.SUPABASE_UPLOAD_BUCKET; // Replace with your actual bucket name
    const path = `uploads/${crypto.randomUUID()}${filename.substring(filename.lastIndexOf("."))}`;

    const { data, error } = await backendSupabase.storage
      .from(bucketName)
      .createSignedUploadUrl(path);

    // TODO: error handling model
    if (error) {
      throw error;
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: data.path,
      token: data.token,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 },
    );
  }
}
