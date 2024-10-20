import { Job, JobSchema, SubmitJob } from "~/model/job";
import { type UploadRequest, type UploadResponse, UploadResponseSchema } from "~/model/upload";

export const createUploadUrl = async (
  upload: UploadRequest,
): Promise<UploadResponse> => {
  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(upload),
    });

    console.log("Response:", response);
    if (!response.ok) {
      console.error("Failed to create upload URL:", response);
      throw new Error("Failed to create upload URL");
    }

    const responseData: unknown = await response.json();
    const validatedData = UploadResponseSchema.parse(responseData);

    return validatedData;
  } catch (error) {
    // TODO: error handling model
    console.error("Error creating upload URL:", error);
    throw error;
  }
};

export const createJob = async (job: SubmitJob): Promise<Job> => {
  try {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });

    console.log("Response:", response);
    if (!response.ok) {
      console.error("Failed to create job:", response);
      throw new Error("Failed to create job");
    }

    const responseData: unknown = await response.json();
    const validatedData = JobSchema.parse(responseData);

    return validatedData;
  } catch (error) {
    // TODO: error handling model
    console.error("Error creating upload URL:", error);
    throw error;
  }
};

export const fetchJSON = async <T>(url: string): Promise<T> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Failed to fetch JSON:", response);
      throw new Error("Failed to fetch JSON");
    }

    return await response.json() as T;
  } catch (error) {
    console.error("Error fetching JSON:", error);
    throw error;
  }
};
