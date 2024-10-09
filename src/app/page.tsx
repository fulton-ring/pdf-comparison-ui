"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Tiptap from "~/components/ui/tiptap";

import { Input } from "~/components/ui/input";
import { createUploadUrl } from "~/client/api";
import { frontendSupabase } from "~/client/supabase";
import { env } from "~/env";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [documentScrollDistance, setDocumentScrollDistance] =
    useState<number>(0);
  const [editorScrollDistance, setEditorScrollDistance] = useState<number>(0);

  const documentRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      const { signedUrl, path, token } = await createUploadUrl(
        selectedFile.name,
      );

      const { error } = await frontendSupabase.storage
        .from(env.NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET)
        .uploadToSignedUrl(path, token, selectedFile);

      if (error) {
        console.error("Error uploading file:", error);
        return;
      }

      console.log("uploaded file!");
      setFile(selectedFile);
    }
  };

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

  // console.log(
  //   "document max scroll:",
  //   documentRef.current?.scrollHeight - documentRef.current?.clientHeight,
  // );
  // console.log(
  //   "editor max scroll:",
  //   editorRef.current?.scrollHeight - editorRef.current?.clientHeight,
  // );

  console.log("documentScrollDistance:", documentScrollDistance);
  console.log("editorScrollDistance:", editorScrollDistance);

  if (!file) {
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
              file={file}
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
          <div
            ref={editorRef}
            className="flex flex-grow overflow-y-auto rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
          >
            {/* <h1 className="text-2xl font-bold">CDS</h1> */}
            <Tiptap className="w-full flex-grow" />
          </div>
        </div>
      </div>

      <div className="col-span-1" />
    </div>
  );
}
