import { UploadRequestSchema, UploadResponseSchema } from "~/model/upload";

export const createUploadUrl = async (filename: string) => {
  try {
    const requestBody = UploadRequestSchema.parse({ filename });

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
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
