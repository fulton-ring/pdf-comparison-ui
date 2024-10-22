import { z } from "zod";

export const JobSchema = z.object({
  id: z.string(),
  status: z.string(),
  outputFormat: z.string(),
  uploadId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Job = z.infer<typeof JobSchema>;

export const JobDocumentSchema = z.object({
  signedUrl: z.string().optional(),
  exp: z.number(),
});

export type JobDocument = z.infer<typeof JobDocumentSchema>;

export const SubmitJobSchema = z.object({
  uploadId: z.string(),
  outputFormat: z.string(),
});

export type SubmitJob = z.infer<typeof SubmitJobSchema>;

export const UpdateJobSchema = z.object({
  status: z.string(),
});

export type UpdateJob = z.infer<typeof UpdateJobSchema>;
