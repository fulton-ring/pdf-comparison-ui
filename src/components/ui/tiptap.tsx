"use client";
import "./tiptap.scss";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import Highlight from "@tiptap/extension-highlight";
// import Typography from "@tiptap/extension-typography";
import { useEffect, useState } from "react";
export type TiptapProps = React.InputHTMLAttributes<HTMLInputElement>;

const Tiptap = ({ ...props }: TiptapProps) => {
  // const [content, setContent] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        // TODO: get markdown content from props
        const response = await fetch("/purdue_2023.md");
        const text = await response.text();

        // setContent(text);
        editor?.commands.setContent(
          `<pre><code>${text.replace(/\n/g, "<br>")}</code></pre>`,
        );
      } catch (error) {
        console.error("Failed to load markdown:", error);
      }
    };

    void loadContent();
  }, [editor]);

  return <EditorContent editor={editor} {...props} />;
};

export default Tiptap;
