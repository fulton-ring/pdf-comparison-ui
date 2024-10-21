"use client";

import { forwardRef } from "react";
import Tiptap from "../ui/tiptap";

interface EditorProps {
  jobStatusMessage: string | null;
  jobPresignedUrl: string | null;
  onChange?: (content: string) => void;
}

const Editor = forwardRef<HTMLDivElement, EditorProps>(
  ({ jobStatusMessage, jobPresignedUrl, onChange }, ref) => {
    return (
      <div
        ref={ref}
        className="flex flex-grow overflow-y-auto rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
      >
        {jobStatusMessage === "completed" ? (
          <Tiptap
            className="w-full flex-grow"
            contentPresignedUrl={jobPresignedUrl}
            onChange={onChange}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {jobStatusMessage && <p>Status: {jobStatusMessage} </p>}
          </div>
        )}
        {/* <h1 className="text-2xl font-bold">CDS</h1> */}
        {/*  */}
      </div>
    );
  },
);

Editor.displayName = "Editor";
export default Editor;
