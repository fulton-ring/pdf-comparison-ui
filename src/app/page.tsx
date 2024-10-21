"use client";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { Input } from "~/components/ui/input";
import { createJob, createUploadUrl } from "~/client/api";
import { frontendSupabase } from "~/client/supabase";
import { env } from "~/env";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      try {
        const { path, token, id } = await createUploadUrl({
          filename: selectedFile.name,
          contentType: selectedFile.type,
          size: selectedFile.size,
        });

        const { error } = await frontendSupabase.storage
          .from(env.NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET)
          .uploadToSignedUrl(path, token, selectedFile);

        if (error) {
          console.error("Error uploading file:", error);
          return;
        }

        const job = await createJob({
          outputFormat: "md",
          uploadId: id,
        });

        router.push(`/jobs/${job.id}`);
      } catch (error) {
        console.error("Error creating job:", error);
      }
    }
  };

  // TODO: error handling
  // TODO: loading spinner

  return (
    <div className="flex h-full w-full justify-center gap-4">
      <div className="flex h-screen flex-col items-center justify-center p-16">
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex items-center justify-center rounded-md border border-slate-200 bg-white p-3 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900">
            Click to upload a file
          </div>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        {/* {uploadStatus && <p className="mt-2 text-sm">{uploadStatus}</p>} */}
      </div>
    </div>
  );
}
