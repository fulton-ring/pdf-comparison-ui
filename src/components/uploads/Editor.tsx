"use client";

import { forwardRef, useEffect, useState } from "react";
import Tiptap from "../ui/tiptap";
import { Button } from "../ui/button";
import { Job } from "~/model/job";
import { createJob } from "~/client/api";
import { frontendSupabase } from "~/client/supabase";

interface EditorProps {
  uploadId: string;
}

const Editor = forwardRef<HTMLDivElement, EditorProps>(({ uploadId }, ref) => {
  // TODO: show launch job button
  // TODO: stream job statuses
  // TODO: if job completed, download file

  const [job, setJob] = useState<Job | null>(null);
  const [jobStatusMessage, setJobStatusMessage] = useState<string | null>(null);

  const handleLaunchJob = async () => {
    try {
      const job = await createJob({
        outputFormat: "md",
        uploadId,
      });

      console.log("job:", job);
      setJob(job);
      setJobStatusMessage(job.status);
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  useEffect(() => {
    if (job) {
      const channel = frontendSupabase.channel(job.id);

      channel.on("broadcast", { event: "status" }, (payload) => {
        console.log("payload:", payload);
        setJobStatusMessage(payload.payload.status);
      });

      channel.subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [job]);

  return (
    <div
      ref={ref}
      className="flex flex-grow overflow-y-auto rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
    >
      {jobStatusMessage === "completed" ? (
        <Tiptap className="w-full flex-grow" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {job ? (
            <Button className="mx-auto">
              Status: {jobStatusMessage}{" "}
              <span className="loading loading-spinner loading-xs"></span>
            </Button>
          ) : (
            <Button className="mx-auto" onClick={handleLaunchJob}>
              Launch Job
            </Button>
          )}
        </div>
      )}
      {/* <h1 className="text-2xl font-bold">CDS</h1> */}
      {/*  */}
    </div>
  );
});

export default Editor;
