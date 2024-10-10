import { z } from "zod";

export const JobSchema = z.object({
  id: z.string(),
  status: z.string(),
  outputFormat: z.string(),
  uploadId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Job = z.infer<typeof JobSchema>;

export const SubmitJobSchema = z.object({
  uploadId: z.string(),
  outputFormat: z.string(),
});

export type SubmitJob = z.infer<typeof SubmitJobSchema>;

