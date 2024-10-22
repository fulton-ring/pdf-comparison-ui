"use client";

import { forwardRef, useState } from "react";
import { DownloadIcon } from "lucide-react";

import Tiptap from "../ui/tiptap";
import { Button } from "../ui/button";
interface EditorProps {
  jobId: string;
  jobPresignedUrl: string | null;
}

const Editor = forwardRef<HTMLDivElement, EditorProps>(
  ({ jobId, jobPresignedUrl }, ref) => {
    const [editorContent, setEditorContent] = useState("");

    const handleDownload = () => {
      // TODO: remove markdown formatting
      const blob = new Blob([editorContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `${jobId}.md`;

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return (
      <div
        ref={ref}
        className="relative flex flex-grow overflow-y-auto rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
      >
        <>
          {jobPresignedUrl && (
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 z-10"
            >
              <DownloadIcon className="h-4 w-4" />
            </Button>
          )}
          <Tiptap
            className="w-full flex-grow"
            contentPresignedUrl={jobPresignedUrl}
            onContentChange={setEditorContent}
          />
        </>
      </div>
    );
  },
);

Editor.displayName = "Editor";
export default Editor;
