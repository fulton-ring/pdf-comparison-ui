"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
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

const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  {
    ssr: false,
  },
);

const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
//   import.meta.url,
// ).toString();
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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

  useEffect(() => {
    const loadPdfJs = async () => {
      const pdfjs = await import("pdfjs-dist");
      // pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      //   "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      //   import.meta.url,
      // ).toString();

      await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs");
      // const pdfjs = await import("pdfjs-dist/types/src/pdf");

      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    };

    void loadPdfJs();
  });

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

  console.log("numPages:", numPages);

  return (
    <div className="grid h-screen w-10/12 grid-cols-8 gap-4 overflow-hidden">
      <div className="col-span-1" />

      <div className="col-span-6 flex flex-col overflow-hidden">
        <div className="grid h-full grid-rows-[1fr,auto] gap-4">
          <div className="grid flex-grow grid-cols-2 gap-4 overflow-hidden">
            <div className="col-span-1 flex flex-col overflow-hidden">
              <p className="py-4 text-2xl text-gray-800">Original:</p>

              <div
                ref={documentRef}
                className="flex flex-grow overflow-y-auto rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
              >
                {uploadPresignedUrl &&
                  uploadExpiration &&
                  uploadExpiration * 1000 > Date.now() && (
                    <Document
                      file={uploadPresignedUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="max-h-full max-w-full"
                      options={options}
                    >
                      {numPages &&
                        Array.from(new Array(numPages), (el, index) => (
                          <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        ))}
                    </Document>
                  )}
              </div>
            </div>

            <div className="col-span-1 flex flex-col overflow-hidden">
              {jobStatusMessage !== "completed" ? (
                <p className="py-4 text-2xl text-slate-400">
                  Status: {jobStatusMessage}
                </p>
              ) : (
                <p className="py-4 text-2xl text-gray-800">Converted:</p>
              )}

              <Editor
                ref={editorRef}
                jobId={params.jobId}
                jobPresignedUrl={jobPresignedUrl}
              />
            </div>
          </div>

          <div className="py-2 text-center">
            <a
              href="https://3yyz40ajyj2.typeform.com/to/fLrhLpb7"
              className="inline-block text-lg text-gray-800 hover:text-slate-400"
            >
              Interested in using our PDF parser? Get in touch
            </a>
          </div>
        </div>
      </div>

      <div className="col-span-1" />
    </div>
  );

  return (
    <div className="grid h-screen w-9/12 grid-cols-8 gap-4 overflow-hidden py-16">
      <div className="col-span-1" />

      <div className="col-span-6 flex flex-col overflow-hidden">
        <div className="grid flex-grow grid-cols-2 grid-rows-2 gap-4 overflow-hidden">
          <div className="col-span-1 flex flex-col overflow-hidden">
            <p className="py-4 text-2xl text-gray-800">Original:</p>

            <div
              ref={documentRef}
              className="flex min-h-[80%] overflow-y-auto rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
            >
              {/* {uploadPresignedUrl &&
                uploadExpiration &&
                uploadExpiration * 1000 > Date.now() && (
                  <Document
                    file={uploadPresignedUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="max-h-full max-w-full"
                    options={options}
                  >
                    {numPages &&
                      Array.from(new Array(numPages), (el, index) => (
                        <Page
                          key={`page_${index + 1}`}
                          pageNumber={index + 1}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      ))}
                  </Document>
                )} */}
            </div>
          </div>

          <div className="col-span-1 flex flex-col overflow-hidden">
            <div className="py-4">
              {jobStatusMessage !== "completed" ? (
                <p className="text-2xl text-slate-400">
                  Status: {jobStatusMessage}
                </p>
              ) : (
                <p className="text-2xl text-gray-800">Converted:</p>
              )}
            </div>

            <div className="flex-grow overflow-y-auto">
              <Editor
                ref={editorRef}
                jobId={params.jobId}
                jobPresignedUrl={jobPresignedUrl}
              />
            </div>
          </div>

          <div className="col-span-2 bg-blue-400 py-2 text-center">
            <a
              href="https://3yyz40ajyj2.typeform.com/to/fLrhLpb7"
              className="inline-block text-lg text-gray-800 hover:text-slate-400"
            >
              Interested in using our PDF parser? Get in touch
            </a>
          </div>
        </div>
      </div>

      <div className="col-span-1" />
    </div>
  );
};

export default DocumentPage;
