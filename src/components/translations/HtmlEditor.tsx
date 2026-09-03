// src/components/translations/HtmlEditor.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  RemoveFormatting,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Underline,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  active,
  disabled,
  title,
  children,
}) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    className={cn(
      "flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    {children}
  </button>
);

const ToolbarDivider: React.FC = () => (
  <div className="h-5 w-px bg-border mx-1" aria-hidden="true" />
);

export default function HtmlEditor({ value, onChange }: HtmlEditorProps) {
  const [showSource, setShowSource] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastValueRef = useRef("");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [active, setActive] = useState<Record<string, boolean>>({});
  const [blockFormat, setBlockFormat] = useState<string>("");

  const updateToolbar = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    try {
      setActive({
        bold: doc.queryCommandState("bold"),
        italic: doc.queryCommandState("italic"),
        underline: doc.queryCommandState("underline"),
        strikeThrough: doc.queryCommandState("strikeThrough"),
        superscript: doc.queryCommandState("superscript"),
        subscript: doc.queryCommandState("subscript"),
        insertUnorderedList: doc.queryCommandState("insertUnorderedList"),
        insertOrderedList: doc.queryCommandState("insertOrderedList"),
        justifyLeft: doc.queryCommandState("justifyLeft"),
        justifyCenter: doc.queryCommandState("justifyCenter"),
        justifyRight: doc.queryCommandState("justifyRight"),
      });
      setBlockFormat(doc.queryCommandValue("formatBlock"));
    } catch (e) {
      // ignore errors that happen if editor isn't fully ready
    }
  }, []);

  const initIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    if (value !== lastValueRef.current || doc.body?.innerHTML === "") {
      lastValueRef.current = value;
      
      // Preserve doctype if present
      const hasDoctype = value.toLowerCase().startsWith("<!doctype");
      
      doc.open();
      doc.write(value || "<html><body></body></html>");
      doc.close();
      doc.designMode = "on";

      const handleSelection = () => updateToolbar();
      const handleInput = () => {
        let html = doc.documentElement.outerHTML;
        if (hasDoctype && !html.toLowerCase().startsWith("<!doctype")) {
          html = "<!DOCTYPE html>\n" + html;
        }
        lastValueRef.current = html;
        onChangeRef.current(html);
      };

      doc.addEventListener("selectionchange", handleSelection);
      doc.addEventListener("input", handleInput);
      
      // Also catch keyup events for formatting changes
      doc.addEventListener("keyup", handleSelection);
      doc.addEventListener("mouseup", handleSelection);
    }
  }, [value, updateToolbar]);

  useEffect(() => {
    if (!showSource) {
      initIframe();
    }
  }, [value, showSource, initIframe]);

  const exec = (cmd: string, val?: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.execCommand(cmd, false, val);
    iframeRef.current?.contentWindow?.focus();
    updateToolbar();
    
    let html = doc.documentElement.outerHTML;
    const hasDoctype = value.toLowerCase().startsWith("<!doctype");
    if (hasDoctype && !html.toLowerCase().startsWith("<!doctype")) {
      html = "<!DOCTYPE html>\n" + html;
    }
    lastValueRef.current = html;
    onChangeRef.current(html);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    lastValueRef.current = html;
    onChange(html);
  };

  const isHeading = (level: string) => {
    // browser might return "h1" or "H1"
    return blockFormat.toLowerCase() === level.toLowerCase();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1 bg-muted/30">
        <ToolbarButton
          onClick={() => exec("formatBlock", "P")}
          active={isHeading("p") || blockFormat === ""}
          title="Paragraph"
        >
          <Pilcrow className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => exec("formatBlock", "H1")}
          active={isHeading("h1")}
          title="Heading 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => exec("formatBlock", "H2")}
          active={isHeading("h2")}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => exec("formatBlock", "H3")}
          active={isHeading("h3")}
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => exec("bold")} active={active.bold} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} active={active.italic} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} active={active.underline} title="Underline">
          <Underline className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("strikeThrough")} active={active.strikeThrough} title="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("superscript")} active={active.superscript} title="Superscript">
          <SuperscriptIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("subscript")} active={active.subscript} title="Subscript">
          <SubscriptIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => exec("insertUnorderedList")} active={active.insertUnorderedList} title="Bulleted list">
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} active={active.insertOrderedList} title="Numbered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => exec("justifyLeft")} active={active.justifyLeft} title="Align left">
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyCenter")} active={active.justifyCenter} title="Align center">
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyRight")} active={active.justifyRight} title="Align right">
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => {
            const doc = iframeRef.current?.contentDocument;
            if (doc) exec("insertHTML", "<table border='1' style='width:100%;border-collapse:collapse;margin-bottom:1em;'><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table>");
          }}
          title="Insert table"
        >
          <TableIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("Enter image URL:");
            if (url) exec("insertImage", url);
          }}
          title="Insert image"
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("removeFormat")} title="Clear formatting">
          <RemoveFormatting className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => exec("undo")} title="Undo">
          <Undo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("redo")} title="Redo">
          <Redo2 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => setShowSource((prev) => !prev)}
          active={showSource}
          title="Edit HTML source"
        >
          <Code2 className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      <div className="flex-1 overflow-auto bg-white relative">
        {showSource ? (
          <textarea
            value={value}
            onChange={handleSourceChange}
            placeholder="Translated content will appear here..."
            className="w-full h-full p-4 resize-none border-none outline-none text-sm leading-relaxed font-mono bg-background text-foreground focus:ring-0 absolute inset-0"
          />
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0 absolute inset-0"
            title="Rich Text Editor"
          />
        )}
      </div>
    </div>
  );
}
