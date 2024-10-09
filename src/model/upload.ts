import { z } from "zod";

export const UploadRequestSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  // contentType: z.string().min(1, "Content type is required"),
});

export type UploadRequest = z.infer<typeof UploadRequestSchema>;

export const UploadResponseSchema = z.object({
  signedUrl: z.string().min(1, "Signed URL is required"),
  path: z.string().min(1, "Path is required"),
  token: z.string().min(1, "Token is required"),
});

export type UploadResponse = z.infer<typeof UploadResponseSchema>;
