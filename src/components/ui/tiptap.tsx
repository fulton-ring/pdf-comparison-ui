"use client";
import "./tiptap.scss";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import Highlight from "@tiptap/extension-highlight";
// import Typography from "@tiptap/extension-typography";
import { useEffect } from "react";

export interface TiptapProps extends React.HTMLAttributes<HTMLDivElement> {
  contentPresignedUrl: string | null;
  onContentChange?: (content: string) => void;
}

const Tiptap = ({
  contentPresignedUrl,
  onContentChange,
  ...props
}: TiptapProps) => {
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

        if (onContentChange) {
          onContentChange(editor.getText());
        }
      } catch (error) {
        console.error("Failed to load markdown:", error);
      }
    };

    void loadContent();
  }, [editor, onContentChange, contentPresignedUrl]);

  const handleInput = () => {
    if (editor && onContentChange) {
      onContentChange(editor.getText());
    }
  };

  return <EditorContent editor={editor} onInput={handleInput} {...props} />;
};

export default Tiptap;
