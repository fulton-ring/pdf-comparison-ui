import { type NextRequest, NextResponse } from "next/server";

import { env } from "~/env";
import { UploadRequestSchema, UploadResponseSchema } from "~/model/upload";
import { db } from "~/server/db";
import { backendSupabase } from "~/server/supabase";

export async function POST(req: NextRequest) {
  let parsedReq;

  try {
    parsedReq = UploadRequestSchema.safeParse(await req.json());

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
    const { filename, contentType, size } = parsedReq.data;

    // create upload in database
    const upload = await db.upload.create({
      data: {
        filename,
        size, // file size in bytes
        type: contentType, // application/pdf
      },
    });

    console.log("Upload:", upload);
    const bucketName = env.SUPABASE_UPLOAD_BUCKET;
    const path = `uploads/${upload.id}.${filename.substring(filename.lastIndexOf("."))}`;

    const { data, error } = await backendSupabase.storage
      .from(bucketName)
      .createSignedUploadUrl(path);

    if (error) {
      throw error;
    }

    return NextResponse.json(UploadResponseSchema.parse({
      id: upload.id,
      filename: upload.filename,
      size: upload.size,
      type: upload.type,
      signedUrl: data.signedUrl,
      path: data.path,
      token: data.token,
      createdAt: upload.created_at.toISOString(),
    }));
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to create upload" },
      { status: 500 },
    );
  }
}
