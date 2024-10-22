"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import useSWR from "swr";

import { fetchJSON } from "~/client/api";
import { getFrontendSupabase } from "~/client/supabase";
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

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
//   import.meta.url,
// ).toString();
// pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentPage = ({ params }: DocumentPageProps) => {
  const [uploadPresignedUrl, setUploadPresignedUrl] = useState<string | null>(
    null,
  );
  const [uploadExpiration, setUploadExpiration] = useState<number | null>(null);
  const [jobPresignedUrl, setJobPresignedUrl] = useState<string | null>(null);
  const [jobExpiration, setJobExpiration] = useState<number | null>(null);
  const [jobStatusMessage, setJobStatusMessage] = useState<string | null>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  // const [documentScrollDistance, setDocumentScrollDistance] =
  //   useState<number>(0);
  // const [editorScrollDistance, setEditorScrollDistance] = useState<number>(0);

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
  //   const loadPdfJs = async () => {
  //     // const pdfjs = await import("pdfjs-dist");
  //     // pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  //     //   "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  //     //   import.meta.url,
  //     // ).toString();

  //     await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs");
  //     // const pdfjs = await import("pdfjs-dist/types/src/pdf");

  //     //pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  //   };

  //   void loadPdfJs();
  // }, []);

  useEffect(() => {
    if (job) {
      const channel = getFrontendSupabase().channel(job.id);

      channel.on("broadcast", { event: "status" }, (payload) => {
        const messagePayload = payload.payload as { status: string };

        setJobStatusMessage(messagePayload.status);
      });

      channel.subscribe();
      setJobStatusMessage(job.status);

      return () => {
        void channel.unsubscribe();
      };
    }
  }, [job]);

  useEffect(() => {
    const getUploadPresignedUrl = async () => {
      if (!job || (uploadExpiration && uploadExpiration * 1000 > Date.now())) {
        return;
      }

      try {
        const upload = await fetchJSON<UploadDocument>(
          `/api/uploads/${job.uploadId}/presignedUrl`,
        );

        setUploadPresignedUrl(upload.signedUrl);
        setUploadExpiration(upload.exp);
      } catch (error) {
        console.error("Error fetching upload presigned URL:", error);
      }
    };

    const fetchJobPresignedUrl = async () => {
      if (
        (jobStatusMessage === "completed" || job?.status === "completed") &&
        (!jobExpiration || jobExpiration * 1000 < Date.now())
      ) {
        try {
          const { signedUrl, exp } = await fetchJSON<JobDocument>(
            `/api/jobs/${params.jobId}/presignedUrl`,
          );

          if (signedUrl) {
            setJobPresignedUrl(signedUrl);
            setJobExpiration(exp);
          }
        } catch (error) {
          console.error("Error fetching job presigned URL:", error);
        }
      }
    };

    void getUploadPresignedUrl();
    void fetchJobPresignedUrl();
  });

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
  console.log("presigned:", uploadPresignedUrl);

  if (uploadExpiration) {
    console.log(
      "presigned expiration:",
      new Date(uploadExpiration * 1000).toLocaleString(),
    );
  }

  return (
    <div className="grid grid-cols-8 gap-4">
      <div className="col-span-1" />

      <div className="col-span-3">
        <div className="flex h-screen flex-col py-16">
          <p className="text-2xl text-gray-800">Original:</p>
          <div
            ref={documentRef}
            className="flex flex-grow resize-none items-center justify-center overflow-y-auto rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
          >
            {uploadPresignedUrl &&
              uploadExpiration &&
              uploadExpiration * 1000 > Date.now() && (
                <Document
                  file={uploadPresignedUrl}
                  // file={"/purdue_2023.pdf"}
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
              )}
          </div>
        </div>
      </div>

      <div className="col-span-3">
        <div className="flex h-screen flex-col py-16">
          {jobStatusMessage !== "completed" ? (
            <p className="text-2xl text-slate-400">
              Converting Document: {jobStatusMessage}
            </p>
          ) : (
            <p className="text-2xl text-gray-800">Converted:</p>
          )}

          <Editor
            ref={editorRef}
            jobId={params.jobId}
            jobPresignedUrl={jobPresignedUrl}
          />
        </div>
      </div>

      <div className="col-span-1" />
    </div>
  );
};

export default DocumentPage;
