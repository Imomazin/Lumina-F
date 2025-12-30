"use client";

import { useState, ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button, Badge } from "@/components/ui";

// ============================================================================
// TYPES
// ============================================================================

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  createdAt: string;
  updatedAt: string;
  resolved: boolean;
  targetType?: string;
  targetId?: string;
  replies?: Comment[];
}

export interface CommentThreadProps {
  comments: Comment[];
  currentUserId: string;
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onResolve: (commentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

// ============================================================================
// COMMENT THREAD COMPONENT
// ============================================================================

export function CommentThread({
  comments,
  currentUserId,
  onAddComment,
  onResolve,
  onDelete,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(replyContent, parentId);
      setReplyContent("");
      setReplyingTo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground placeholder:text-foreground-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          rows={3}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-foreground-muted py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onResolve={onResolve}
              onDelete={onDelete}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onReply={handleReply}
              isSubmitting={isSubmitting}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMMENT ITEM COMPONENT
// ============================================================================

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onResolve: (commentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onReply: (parentId: string) => Promise<void>;
  isSubmitting: boolean;
  isReply?: boolean;
}

function CommentItem({
  comment,
  currentUserId,
  onResolve,
  onDelete,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onReply,
  isSubmitting,
  isReply = false,
}: CommentItemProps) {
  const isAuthor = comment.authorId === currentUserId;

  return (
    <div className={`${isReply ? "ml-8 border-l-2 border-border pl-4" : ""}`}>
      <div
        className={`rounded-lg border p-4 ${
          comment.resolved
            ? "border-success/30 bg-success/5"
            : "border-border bg-surface"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              {comment.authorImage ? (
                <img
                  src={comment.authorImage}
                  alt={comment.authorName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-sm font-medium text-primary">
                  {comment.authorName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {comment.authorName}
              </p>
              <p className="text-xs text-foreground-muted">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comment.resolved && (
              <Badge variant="success">Resolved</Badge>
            )}
            <div className="flex gap-1">
              {!comment.resolved && (
                <button
                  onClick={() => onResolve(comment.id)}
                  className="p-1 text-foreground-muted hover:text-success transition-colors"
                  title="Resolve"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              {isAuthor && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="p-1 text-foreground-muted hover:text-danger transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Reply Button */}
        {!isReply && (
          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="mt-3 text-xs text-foreground-muted hover:text-primary transition-colors"
          >
            Reply
          </button>
        )}

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-foreground placeholder:text-foreground-muted resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => onReply(comment.id)}
                disabled={isSubmitting || !replyContent.trim()}
              >
                Reply
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onResolve={onResolve}
              onDelete={onDelete}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onReply={onReply}
              isSubmitting={isSubmitting}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ACTIVITY FEED COMPONENT
// ============================================================================

export interface Activity {
  id: string;
  type: "created" | "updated" | "commented" | "shared" | "exported" | "approved";
  userId: string;
  userName: string;
  userImage?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons: Record<Activity["type"], ReactNode> = {
  created: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  updated: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  commented: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  shared: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  exported: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  approved: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const activityColors: Record<Activity["type"], string> = {
  created: "bg-success/20 text-success",
  updated: "bg-primary/20 text-primary",
  commented: "bg-accent/20 text-accent",
  shared: "bg-warning/20 text-warning",
  exported: "bg-info/20 text-info",
  approved: "bg-success/20 text-success",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p className="text-center text-foreground-muted py-8">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3">
          {/* Timeline Line */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${activityColors[activity.type]}`}
            >
              {activityIcons[activity.type]}
            </div>
            {index < activities.length - 1 && (
              <div className="w-px h-full bg-border mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <p className="text-sm text-foreground">
              <span className="font-medium">{activity.userName}</span>{" "}
              {activity.description}
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// PRESENCE INDICATORS
// ============================================================================

export interface OnlineUser {
  id: string;
  name: string;
  image?: string;
  color: string;
}

interface PresenceIndicatorProps {
  users: OnlineUser[];
  maxDisplay?: number;
}

export function PresenceIndicator({ users, maxDisplay = 4 }: PresenceIndicatorProps) {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayUsers.map((user) => (
          <div
            key={user.id}
            className="w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full rounded-full"
              />
            ) : (
              <span className="text-xs font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-2 flex items-center justify-center">
            <span className="text-xs font-medium text-foreground-muted">
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
      <span className="ml-3 text-sm text-foreground-muted">
        {users.length} {users.length === 1 ? "viewer" : "viewers"}
      </span>
    </div>
  );
}

// ============================================================================
// NOTIFICATION BELL
// ============================================================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export function NotificationBell({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-foreground-muted hover:text-foreground transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-surface shadow-lg z-50">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-sm text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-foreground-muted">
                  No notifications
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => onMarkRead(notification.id)}
                    className={`p-4 border-b border-border last:border-0 cursor-pointer hover:bg-surface-2 transition-colors ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.read && (
                        <span className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-sm text-foreground-muted mt-0.5 truncate">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-foreground-muted mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
