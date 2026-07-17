"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FaBold, FaItalic, FaHeading, FaLink, FaListUl, FaListOl,
  FaQuoteLeft, FaCode, FaImage,
} from "react-icons/fa";
import "@/styles/Blog.css";
import { blogApi } from "@/utils/api";
import ImageUploader from "@/component/imgComponent";
import { BlogPost } from "./blogUtils";

type ViewMode = "write" | "split" | "preview";

interface BlogEditorProps {
  mode: "create" | "edit";
  postId?: string;
  initial?: Partial<BlogPost>;
}

export default function BlogEditor({ mode, postId, initial }: BlogEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [coverImage, setCoverImage] = useState<string | null>(initial?.coverImage || null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inserts markdown syntax around the current selection (or at the cursor,
  // with a placeholder, if nothing's selected) — a lightweight stand-in for
  // a full WYSIWYG toolbar per the "markdown + live preview" design decision.
  const wrapSelection = (before: string, after = before, placeholder = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = start + before.length + selected.length + after.length;
      ta.setSelectionRange(cursor, cursor);
    });
  };

  const insertLinePrefix = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const next = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  };

  const toolbar = [
    { icon: <FaBold size={13} />, label: "Bold", action: () => wrapSelection("**", "**", "bold text") },
    { icon: <FaItalic size={13} />, label: "Italic", action: () => wrapSelection("_", "_", "italic text") },
    { icon: <FaHeading size={13} />, label: "Heading", action: () => insertLinePrefix("## ") },
    { icon: <FaQuoteLeft size={13} />, label: "Quote", action: () => insertLinePrefix("> ") },
    { icon: <FaListUl size={13} />, label: "Bullet list", action: () => insertLinePrefix("- ") },
    { icon: <FaListOl size={13} />, label: "Numbered list", action: () => insertLinePrefix("1. ") },
    { icon: <FaLink size={13} />, label: "Link", action: () => wrapSelection("[", "](https://)", "link text") },
    { icon: <FaCode size={13} />, label: "Code", action: () => wrapSelection("`", "`", "code") },
  ];

  const validate = () => {
    if (!title.trim() || title.trim().length < 3) return "Title must be at least 3 characters.";
    if (title.trim().length > 150) return "Title must be 150 characters or fewer.";
    if (!content.trim()) return "Write something before publishing.";
    if (content.trim().length > 50000) return "Content is too long (max 50,000 characters).";
    return null;
  };

  const save = async (status: "draft" | "published") => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(null);
    setSaving(true);
    try {
      const body = { title: title.trim(), content: content.trim(), coverImage, status };
      if (mode === "create") {
        const res: any = await blogApi.create(body);
        router.push(`/blog/${res.post.slug}`);
      } else if (postId) {
        const res: any = await blogApi.update(postId, body);
        router.push(`/blog/${res.post.slug}`);
      }
    } catch (err: any) {
      setError(err?.message || "Couldn't save your post. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="blog-page">
      <div className="blog-editor-header">
        <h1 style={{ fontSize: "1.6rem", margin: "0 0 4px" }}>{mode === "create" ? "Write a new story" : "Edit story"}</h1>
        <p className="blog-editor-sub">Markdown supported — use the toolbar or type it yourself. Save as a draft any time.</p>
      </div>

      {error && <div className="blog-field-error">{error}</div>}

      <input
        className="blog-editor-title-input"
        placeholder="Your story's title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={150}
      />

      <div className="blog-editor-cover-zone">
        {coverImage && (
          <div className="blog-editor-cover-preview">
            <img src={coverImage} alt="Cover" />
          </div>
        )}
        <ImageUploader
          folder="blog_covers"
          label={coverImage ? "Change cover image (optional)" : "Add a cover image (optional)"}
          onUploaded={(file) => setCoverImage(file?.url || null)}
        />
      </div>

      <div className="blog-editor-toolbar">
        {toolbar.map((t) => (
          <button key={t.label} type="button" className="blog-toolbar-btn" title={t.label} onClick={t.action}>
            {t.icon}
          </button>
        ))}
        <div className="blog-toolbar-spacer" />
        <div className="blog-toolbar-toggle">
          <button type="button" className={viewMode === "write" ? "active" : ""} onClick={() => setViewMode("write")}>Write</button>
          <button type="button" className={viewMode === "split" ? "active" : ""} onClick={() => setViewMode("split")}>Split</button>
          <button type="button" className={viewMode === "preview" ? "active" : ""} onClick={() => setViewMode("preview")}>Preview</button>
        </div>
      </div>

      <div className={`blog-editor-panes ${viewMode !== "split" ? "single-pane" : ""}`}>
        {viewMode !== "preview" && (
          <textarea
            ref={textareaRef}
            className="blog-editor-textarea"
            placeholder="Tell your story in Markdown… ## Headings, **bold**, _italic_, > quotes, - lists, and more."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={50000}
          />
        )}
        {viewMode !== "write" && (
          <div className="blog-editor-preview">
            <div className="blog-article">
              {content.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <p style={{ color: "var(--blog-muted)" }}>Nothing to preview yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="blog-editor-footer">
        <span className="blog-editor-char-count">{content.length.toLocaleString()} / 50,000 characters</span>
        <div className="blog-editor-footer-left">
          <button className="blog-btn blog-btn-secondary" disabled={saving} onClick={() => save("draft")}>
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button className="blog-btn blog-btn-primary" disabled={saving} onClick={() => save("published")}>
            {saving ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
