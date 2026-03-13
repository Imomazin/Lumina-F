"use client";

import { useState, useEffect, useMemo } from "react";
import { GlassPanel, PremiumButton, Badge } from "@/components/ui/design-system";

// =============================================================================
// TYPES
// =============================================================================

interface Comment {
  id: string;
  author: string;
  authorInitials: string;
  authorColor: string;
  content: string;
  timestamp: Date;
  target?: {
    type: "assumption" | "metric" | "general";
    label: string;
  };
  resolved: boolean;
  replies: Comment[];
}

// =============================================================================
// STORAGE
// =============================================================================

const COMMENTS_KEY = "lumina-comments";

const AUTHOR_COLORS = [
  "bg-amber-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-pink-500", "bg-cyan-500", "bg-orange-500", "bg-indigo-500",
];

function loadComments(): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(COMMENTS_KEY);
    if (!data) return generateDefaultComments();
    return JSON.parse(data).map((c: Comment) => ({
      ...c,
      timestamp: new Date(c.timestamp),
      replies: c.replies.map((r: Comment) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      })),
    }));
  } catch {
    return generateDefaultComments();
  }
}

function saveComments(comments: Comment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

function generateDefaultComments(): Comment[] {
  const now = new Date();
  return [
    {
      id: "1",
      author: "Sarah Chen",
      authorInitials: "SC",
      authorColor: "bg-amber-500",
      content: "The revenue growth assumption of 15% seems aggressive for Year 3. Can we validate this with market research?",
      timestamp: new Date(now.getTime() - 2 * 3600000),
      target: { type: "assumption", label: "Revenue Growth Y3" },
      resolved: false,
      replies: [
        {
          id: "1-1",
          author: "Michael Park",
          authorInitials: "MP",
          authorColor: "bg-blue-500",
          content: "Good point. I've checked with industry reports - 12% might be more realistic.",
          timestamp: new Date(now.getTime() - 1 * 3600000),
          resolved: false,
          replies: [],
        },
      ],
    },
    {
      id: "2",
      author: "David Kim",
      authorInitials: "DK",
      authorColor: "bg-green-500",
      content: "WACC calculation looks correct. Verified against comparable companies.",
      timestamp: new Date(now.getTime() - 24 * 3600000),
      target: { type: "metric", label: "WACC" },
      resolved: true,
      replies: [],
    },
    {
      id: "3",
      author: "Emily Johnson",
      authorInitials: "EJ",
      authorColor: "bg-purple-500",
      content: "Need to discuss terminal growth rate with the board before finalizing.",
      timestamp: new Date(now.getTime() - 48 * 3600000),
      resolved: false,
      replies: [],
    },
  ];
}

// =============================================================================
// COMPONENTS
// =============================================================================

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function CommentItem({
  comment,
  onResolve,
  onReply,
  isReply = false,
}: {
  comment: Comment;
  onResolve: (id: string) => void;
  onReply: (id: string, content: string) => void;
  isReply?: boolean;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyInput(false);
    }
  };

  return (
    <div className={`${isReply ? "ml-8 mt-3" : ""}`}>
      <div className={`p-3 rounded-lg ${comment.resolved ? "bg-zinc-800/30 opacity-60" : "bg-zinc-800/50"}`}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full ${comment.authorColor} flex items-center justify-center flex-shrink-0 text-xs font-bold text-white`}>
            {comment.authorInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-white">{comment.author}</span>
              <span className="text-xs text-zinc-500">{formatTimeAgo(comment.timestamp)}</span>
              {comment.target && (
                <Badge variant="info">{comment.target.label}</Badge>
              )}
              {comment.resolved && (
                <Badge variant="success">Resolved</Badge>
              )}
            </div>
            <p className="text-sm text-zinc-300 mt-1">{comment.content}</p>

            {/* Actions */}
            {!isReply && (
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Reply
                </button>
                {!comment.resolved && (
                  <button
                    onClick={() => onResolve(comment.id)}
                    className="text-xs text-zinc-400 hover:text-green-400 transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <div className="mt-3 ml-11">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none resize-none"
              rows={2}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowReplyInput(false)}
                className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReply}
                className="px-3 py-1 text-xs bg-amber-500 text-black rounded-lg hover:bg-amber-400"
              >
                Reply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onResolve={onResolve}
          onReply={onReply}
          isReply
        />
      ))}
    </div>
  );
}

export function CommentsPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  useEffect(() => {
    setComments(loadComments());
  }, []);

  const filteredComments = useMemo(() => {
    switch (filter) {
      case "open":
        return comments.filter((c) => !c.resolved);
      case "resolved":
        return comments.filter((c) => c.resolved);
      default:
        return comments;
    }
  }, [comments, filter]);

  const openCount = comments.filter((c) => !c.resolved).length;

  const handleResolve = (id: string) => {
    const updated = comments.map((c) =>
      c.id === id ? { ...c, resolved: true } : c
    );
    setComments(updated);
    saveComments(updated);
  };

  const handleReply = (parentId: string, content: string) => {
    const newReply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: "You",
      authorInitials: "YU",
      authorColor: AUTHOR_COLORS[Math.floor(Math.random() * AUTHOR_COLORS.length)],
      content,
      timestamp: new Date(),
      resolved: false,
      replies: [],
    };

    const updated = comments.map((c) =>
      c.id === parentId ? { ...c, replies: [...c.replies, newReply] } : c
    );
    setComments(updated);
    saveComments(updated);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: "You",
      authorInitials: "YU",
      authorColor: AUTHOR_COLORS[Math.floor(Math.random() * AUTHOR_COLORS.length)],
      content: newComment,
      timestamp: new Date(),
      resolved: false,
      replies: [],
    };

    const updated = [comment, ...comments];
    setComments(updated);
    saveComments(updated);
    setNewComment("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 z-40 animate-[slideIn_0.2s_ease-out]">
      <GlassPanel padding="none" className="h-full rounded-none border-l border-zinc-800">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              💬 Comments
              {openCount > 0 && (
                <Badge variant="warning">{openCount} open</Badge>
              )}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(["all", "open", "resolved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize ${
                  filter === f
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* New comment input */}
        <div className="p-4 border-b border-zinc-800">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <PremiumButton
              variant="primary"
              size="sm"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Add Comment
            </PremiumButton>
          </div>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">💭</span>
              <p className="text-zinc-400 mt-2">No comments yet</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onResolve={handleResolve}
                onReply={handleReply}
              />
            ))
          )}
        </div>
      </GlassPanel>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
