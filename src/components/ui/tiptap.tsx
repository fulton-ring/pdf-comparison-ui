"use client";
import "./tiptap.scss";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import Highlight from "@tiptap/extension-highlight";
// import Typography from "@tiptap/extension-typography";
import { useEffect, useState } from "react";

export interface TiptapProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  contentPresignedUrl: string | null;
  onChange?: (content: string) => void;
}

const Tiptap = ({ contentPresignedUrl, onChange, ...props }: TiptapProps) => {
  // const [content, setContent] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  useEffect(() => {
    const loadContent = async () => {
      if (!contentPresignedUrl || !editor) {
        return;
      }

      try {
        const response = await fetch(contentPresignedUrl);
        const text = await response.text();

        // setContent(text);
        editor.commands.setContent(
          `<pre><code>${text.replace(/\n/g, "<br>")}</code></pre>`,
        );

        if (onChange) {
          onChange(editor.getText());
        }
      } catch (error) {
        console.error("Failed to load markdown:", error);
      }
    };

    void loadContent();
  }, [editor, contentPresignedUrl]);

  const handleInput = () => {
    if (editor && onChange) {
      onChange(editor.getText());
    }
  };

  return <EditorContent editor={editor} onInput={handleInput} {...props} />;
};

export default Tiptap;
