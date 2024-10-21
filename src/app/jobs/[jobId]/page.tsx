"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import useSWR from "swr";

import { fetchJSON } from "~/client/api";
import Editor from "~/components/uploads/Editor";
import { Job } from "~/model/job";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

interface DocumentPageProps {
  params: { jobId: string };
}

const DocumentPage = ({ params }: DocumentPageProps) => {
  // TODO: stream status messages of upload

  const [numPages, setNumPages] = useState<number | null>(null);
  const [documentScrollDistance, setDocumentScrollDistance] =
    useState<number>(0);
  const [editorScrollDistance, setEditorScrollDistance] = useState<number>(0);

  const documentRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const { data: job, mutate } = useSWR<Job>(
    `/api/jobs/${params.jobId}`,
    fetchJSON,
  );

  const handleDocumentScroll = useCallback(() => {
    const container = documentRef.current;
    if (container) {
      setDocumentScrollDistance(container.scrollTop);
    }
  }, []);

  const handleEditorScroll = useCallback(() => {
    const editorContainer = editorRef.current;

    if (editorContainer) {
      setDocumentScrollDistance(editorContainer.scrollTop);
    }
  }, []);

  // TODO: begin processing PDF when file is uploaded

  useEffect(() => {
    const container = documentRef.current;
    // // if (!container || !numPages) return;

    // const handleScroll = () => {
    //   const { scrollTop, scrollHeight, clientHeight } = container;
    //   // const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    //   // const page = Math.ceil(scrollPercentage * numPages);
    //   // setPageNumber(page);
    //   // setDocumentScrollPercentage(Math.round(scrollPercentage * 100));
    //   setDocumentScrollDistance(scrollTop);
    // };

    if (container) {
      container.addEventListener("scroll", handleDocumentScroll);
      return () =>
        container.removeEventListener("scroll", handleDocumentScroll);
    }
  }, [handleDocumentScroll]);

  useEffect(() => {
    const container = editorRef.current;
    if (container) {
      container.addEventListener("scroll", handleEditorScroll);
      return () => container.removeEventListener("scroll", handleEditorScroll);
    }
  }, [handleEditorScroll]);

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

  console.log("documentScrollDistance:", documentScrollDistance);
  console.log("editorScrollDistance:", editorScrollDistance);

  // TODO: error handling
  // TODO: loading spinner

  return (
    <div className="grid grid-cols-8 gap-4">
      <div className="col-span-1" />

      <div className="col-span-3">
        <div className="flex h-screen flex-col py-16">
          <div
            ref={documentRef}
            className="flex flex-grow resize-none items-center justify-center overflow-y-auto rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
          >
            <Document
              file={upload?.signedUrl}
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
          </div>
          {/* <p className="mt-2 text-center">
            Scroll to navigate through pages (1 - {numPages})
          </p> */}
        </div>
      </div>

      <div className="col-span-3">
        <div className="flex h-screen flex-col py-16">
          <Editor ref={editorRef} jobId={params.jobId} />
        </div>
      </div>

      <div className="col-span-1" />
    </div>
  );
};

export default DocumentPage;
