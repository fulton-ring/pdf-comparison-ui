"use client";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { Input } from "~/components/ui/input";
import { createJob, createUploadUrl } from "~/client/api";
import { getFrontendSupabase } from "~/client/supabase";
import { env } from "~/env";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export default function HomePage() {
  const router = useRouter();

  const [uploadStatus, setUploadStatus] = useState("Click to upload a file");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setIsUploading(true);
      setErrorMessage(null);
      setUploadStatus("Creating upload URL...");
      try {
        const { path, token, id } = await createUploadUrl({
          filename: selectedFile.name,
          contentType: selectedFile.type,
          size: selectedFile.size,
        });

        setUploadStatus("Uploading file...");
        const { error } = await getFrontendSupabase()
          .storage.from("uploads")
          .uploadToSignedUrl(path, token, selectedFile);

        if (error) {
          throw new Error("Error uploading file: " + (error as Error).message);
        }

        setUploadStatus("Creating job...");
        const job = await createJob({
          outputFormat: "md",
          uploadId: id,
        });

        setUploadStatus("Redirecting...");
        router.push(`/jobs/${job.id}`);
      } catch (error) {
        console.error("Error:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        );
        setUploadStatus("Upload failed");
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex h-full w-full justify-center gap-4">
      <div className="flex h-screen flex-col items-center justify-center space-y-4 p-16">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Error Uploading File:</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${isUploading ? "pointer-events-none" : ""}`}
        >
          <div className="flex items-center justify-center rounded-md border border-slate-200 bg-white p-3 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900">
            {isUploading ? (
              <>
                {uploadStatus}&nbsp;&nbsp;
                <span className="loading loading-spinner loading-xs" />
              </>
            ) : (
              "Click to upload a file"
            )}
          </div>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}
