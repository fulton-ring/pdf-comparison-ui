import { z } from "zod";

export const UploadSchema = z.object({
  id: z.string(),
  filename: z.string(),
  size: z.number(),
  type: z.string(),
  signedUrl: z.string(),
  createdAt: z.string().min(1, "Created at is required"),
});

export type Upload = z.infer<typeof UploadSchema>;

export const UploadRequestSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  contentType: z.string().min(1, "Content type is required"),
  size: z.number().min(1, "Size is required"),
});

export type UploadRequest = z.infer<typeof UploadRequestSchema>;

export const UploadResponseSchema = z.object({
  id: z.string().min(1, "ID is required"),
  filename: z.string().min(1, "Filename is required"),
  size: z.number().min(1, "Size is required"),
  type: z.string().min(1, "Content type is required"),
  signedUrl: z.string().min(1, "Signed URL is required"),
  path: z.string().min(1, "Path is required"),
  token: z.string().min(1, "Token is required"),
  createdAt: z.string().min(1, "Created at is required"),
});

export type UploadResponse = z.infer<typeof UploadResponseSchema>;
