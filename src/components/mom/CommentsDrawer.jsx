import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Send } from "lucide-react";
import { listComments, createComment } from "../../services/momApi";
import { useToast } from "../../contexts/ToastContext";
import { THEME_COLORS } from "../../constants/colors";
import Loader from "../Loader";

const DRAWER_Z_BACKDROP = 1300;
const DRAWER_Z_PANEL = 1301;

export default function CommentsDrawer({ actionItem, open, onClose, onCommentAdded }) {
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return undefined;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = prevOverflow;
      setVisible(false);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !actionItem?.id) return undefined;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await listComments(actionItem.id);
        if (mounted && res.success) setComments(res.data || []);
      } catch {
        showToast("Failed to load comments", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const focusT = setTimeout(() => inputRef.current?.focus(), 200);
    return () => {
      mounted = false;
      clearTimeout(focusT);
    };
  }, [open, actionItem?.id, showToast]);

  useEffect(() => {
    if (!open) {
      setText("");
      setComments([]);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!text.trim() || !actionItem?.id) return;
    setSubmitting(true);
    try {
      const res = await createComment(actionItem.id, text.trim());
      if (res.success) {
        setComments((prev) => [res.data, ...prev]);
        setText("");
        onCommentAdded?.(res.data);
      }
    } catch {
      showToast("Failed to add comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-200"
        style={{
          zIndex: DRAWER_Z_BACKDROP,
          opacity: visible ? 1 : 0,
        }}
        onClick={onClose}
        onMouseDown={(e) => e.stopPropagation()}
        aria-hidden="true"
      />
      <aside
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{
          zIndex: DRAWER_Z_PANEL,
          borderLeft: `1px solid ${THEME_COLORS.deepBlue}15`,
          transform: visible ? "translateX(0)" : "translateX(100%)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Comments"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ background: `linear-gradient(135deg, ${THEME_COLORS.deepBlue}08, ${THEME_COLORS.mediumTeal}08)` }}
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: THEME_COLORS.mediumTeal }}>
              Comments
            </p>
            <p className="text-sm font-medium truncate" style={{ color: THEME_COLORS.deepBlue }}>
              {actionItem?.title || "Action item"}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close comments"
          >
            <X size={18} style={{ color: THEME_COLORS.copper }} />
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {loading ? (
            <Loader message="Loading comments..." fullScreen={false} />
          ) : comments.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-8">No comments yet</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="rounded-lg px-3 py-2" style={{ background: "#f8fafc" }}>
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold" style={{ color: THEME_COLORS.deepBlue }}>
                    {c.commented_by_name || "User"}
                  </span>
                  <span className="text-[10px] text-neutral-400 shrink-0">
                    {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{c.comment}</p>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t p-3 flex gap-2 shrink-0 bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm border rounded-lg px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#5a9ba8]/40"
            style={{ borderColor: `${THEME_COLORS.mediumTeal}60` }}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="kz-btn-primary px-3 py-2 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </aside>
    </>,
    document.body
  );
}
