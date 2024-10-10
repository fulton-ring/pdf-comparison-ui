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
