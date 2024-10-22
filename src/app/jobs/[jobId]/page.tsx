"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import useSWR from "swr";

import { fetchJSON } from "~/client/api";
import { frontendSupabase } from "~/client/supabase";
import { Button } from "~/components/ui/button";
import Editor from "~/components/uploads/Editor";
import { type Job, type JobDocument } from "~/model/job";
import { type UploadDocument } from "~/model/upload";

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

interface DocumentPageProps {
  params: { jobId: string };
}

const DocumentPage = ({ params }: DocumentPageProps) => {
  const [uploadPresignedUrl, setUploadPresignedUrl] = useState<string | null>(
    null,
  );
  const [jobPresignedUrl, setJobPresignedUrl] = useState<string | null>(null);
  const [jobStatusMessage, setJobStatusMessage] = useState<string | null>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  // const [documentScrollDistance, setDocumentScrollDistance] =
  //   useState<number>(0);
  // const [editorScrollDistance, setEditorScrollDistance] = useState<number>(0);
  const [editorContent, setEditorContent] = useState<string>("");

  const documentRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const { data: job } = useSWR<Job>(`/api/jobs/${params.jobId}`, fetchJSON);

  // const handleDocumentScroll = useCallback(() => {
  //   const container = documentRef.current;
  //   if (container) {
  //     setDocumentScrollDistance(container.scrollTop);
  //   }
  // }, []);

  // const handleEditorScroll = useCallback(() => {
  //   const editorContainer = editorRef.current;

  //   if (editorContainer) {
  //     setDocumentScrollDistance(editorContainer.scrollTop);
  //   }
  // }, []);

  // useEffect(() => {
  //   pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  //     "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  //     import.meta.url,
  //   ).toString();
  // }, []);

  useEffect(() => {
    const getUploadPresignedUrl = async () => {
      if (!job) {
        return;
      }

      try {
        const upload = await fetchJSON<UploadDocument>(
          `/api/uploads/${job.uploadId}/presignedUrl`,
        );

        setUploadPresignedUrl(upload.signedUrl);
      } catch (error) {
        console.error("Error fetching upload presigned URL:", error);
      }
    };

    const fetchJobPresignedUrl = async () => {
      if (job?.status === "completed") {
        try {
          const { signedUrl } = await fetchJSON<JobDocument>(
            `/api/jobs/${job.id}/presignedUrl`,
          );

          if (signedUrl) {
            setJobPresignedUrl(signedUrl);
          }
        } catch (error) {
          console.error("Error fetching job presigned URL:", error);
        }
      }
    };

    if (job) {
      const channel = frontendSupabase.channel(job.id);

      channel.on("broadcast", { event: "status" }, (payload) => {
        const messagePayload = payload.payload as { status: string };

        setJobStatusMessage(messagePayload.status);
      });

      channel.subscribe();
      setJobStatusMessage(job.status);

      void getUploadPresignedUrl();
      void fetchJobPresignedUrl();

      return () => {
        void channel.unsubscribe();
      };
    }
  }, [job]);

  // useEffect(() => {
  //   const container = documentRef.current;
  //   // // if (!container || !numPages) return;

  //   // const handleScroll = () => {
  //   //   const { scrollTop, scrollHeight, clientHeight } = container;
  //   //   // const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
  //   //   // const page = Math.ceil(scrollPercentage * numPages);
  //   //   // setPageNumber(page);
  //   //   // setDocumentScrollPercentage(Math.round(scrollPercentage * 100));
  //   //   setDocumentScrollDistance(scrollTop);
  //   // };

  //   if (container) {
  //     container.addEventListener("scroll", handleDocumentScroll);
  //     return () =>
  //       container.removeEventListener("scroll", handleDocumentScroll);
  //   }
  // }, [handleDocumentScroll]);

  // useEffect(() => {
  //   const container = editorRef.current;
  //   if (container) {
  //     container.addEventListener("scroll", handleEditorScroll);
  //     return () => container.removeEventListener("scroll", handleEditorScroll);
  //   }
  // }, [handleEditorScroll]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    pageRefs.current = new Array(numPages).fill(
      null,
    ) as (HTMLDivElement | null)[];
  }

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleDownload = () => {
    if (!job) {
      return;
    }

    // TODO: remove markdown formatting
    const blob = new Blob([editorContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${job.id}.md`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // const scrollToPage = (pageNumber: number) => {
  //   if (numPages && (pageNumber < 1 || pageNumber > numPages)) return;

  //   const pageElement = pageRefs.current[pageNumber - 1];
  //   if (pageElement && containerRef.current) {
  //     containerRef.current.scrollTo({
  //       top: pageElement.offsetTop,
  //       behavior: "smooth",
  //     });
  //   }
  // };

  // console.log("documentScrollDistance:", documentScrollDistance);
  // console.log("editorScrollDistance:", editorScrollDistance);

  // TODO: error handling
  // TODO: loading spinner

  return (
    <div className="grid h-screen w-full grid-cols-8 gap-4 py-16">
      <div className="col-span-1" />

      <div className="col-span-6">
        <div className="grid h-full grid-cols-2 gap-4">
          <div className="col-span-1 flex h-full flex-col">
            <div
              ref={documentRef}
              className="flex flex-grow resize-none items-center justify-center overflow-y-auto rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
            >
              <Document
                file={uploadPresignedUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="max-h-full max-w-full"
                options={options}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    // width={window.innerWidth * 0.3} // Adjust this value as needed
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                ))}
              </Document>
            </div>
          </div>

          <div className="col-span-1 flex h-full flex-col">
            <Editor
              ref={editorRef}
              jobStatusMessage={jobStatusMessage}
              jobPresignedUrl={jobPresignedUrl}
              onChange={handleEditorChange}
            />
          </div>

          {jobPresignedUrl && (
            <div className="col-span-2 flex h-full flex-col">
              <Button className="w-full" onClick={handleDownload}>
                Download Markdown
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-1" />
    </div>
  );
};

export default DocumentPage;
