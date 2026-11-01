import React, { useState, useEffect } from 'react';
import { Heart, Reply, Trash2, Send, Loader2, ShieldAlert } from 'lucide-react';
import { Comment } from '../../types';
import { commentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CommentSectionProps {
  postId: string;
  onCommentCountChange?: (count: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCommentCountChange }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [moderationError, setModerationError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const res = await commentService.getComments(postId);
      setComments(res.data);
      if (onCommentCountChange) {
        let total = res.data.length;
        for (const c of res.data) {
          total += (c.replies?.length || 0);
        }
        onCommentCountChange(total);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    setModerationError(null);

    try {
      const res = await commentService.createComment(postId, {
        content: newComment.trim(),
      });
      if (res.data._id) {
        setComments((prev) => [...prev, res.data]);
        setNewComment('');
        if (onCommentCountChange) {
          onCommentCountChange(comments.length + 1);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setModerationError(err.response.data?.error || 'Comment blocked by campus safety policy.');
      } else {
        setModerationError(err.response?.data?.error || 'Failed to post comment.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    setModerationError(null);

    try {
      const res = await commentService.createComment(postId, {
        content: replyContent.trim(),
        parentCommentId,
      });

      if (res.data._id) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === parentCommentId
              ? { ...c, replies: [...(c.replies || []), res.data] }
              : c
          )
        );
        setReplyContent('');
        setReplyingToId(null);
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setModerationError(err.response.data?.error || 'Reply blocked by campus safety policy.');
      } else {
        setModerationError(err.response?.data?.error || 'Failed to post reply.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    try {
      const res = await commentService.likeComment(commentId);
      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === parentId
              ? {
                  ...c,
                  replies: c.replies?.map((r) => (r._id === commentId ? res.data : r)),
                }
              : c
          )
        );
      } else {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, likes: res.data.likes } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    try {
      await commentService.deleteComment(commentId);
      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === parentId
              ? { ...c, replies: c.replies?.filter((r) => r._id !== commentId) }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3.5">
      {/* Moderation Error Alert */}
      {moderationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>{moderationError}</span>
        </div>
      )}

      {/* Comment Input */}
      {currentUser && (
        <form onSubmit={handleCreateComment} className="flex items-start gap-2.5">
          <img
            src={
              currentUser.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff`
            }
            alt=""
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Add a comment to this discussion..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded-lg"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4 text-xs text-slate-400">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-3 text-xs text-slate-400">
          No comments yet. Be the first to hook into this discussion!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isLiked = currentUser
              ? comment.likes?.some((id) => id.toString() === currentUser._id.toString())
              : false;
            const isAuthor = currentUser?._id === comment.author?._id;

            return (
              <div key={comment._id} className="space-y-2">
                {/* Parent Comment */}
                <div className="flex items-start gap-2.5">
                  <img
                    src={
                      comment.author?.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.name || 'User')}&background=2563eb&color=fff`
                    }
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-1"
                  />
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="font-bold text-slate-900">{comment.author?.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2">
                          {new Date(comment.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {isAuthor && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-800 leading-relaxed">{comment.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-2 pt-1 border-t border-slate-200/50 text-[11px] text-slate-500">
                      <button
                        onClick={() => handleLikeComment(comment._id)}
                        className={`flex items-center gap-1 font-semibold transition-colors ${
                          isLiked ? 'text-blue-600' : 'hover:text-slate-900'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-blue-600' : ''}`} />
                        <span>{comment.likes?.length || 0}</span>
                      </button>
                      <button
                        onClick={() =>
                          setReplyingToId(replyingToId === comment._id ? null : comment._id)
                        }
                        className="flex items-center gap-1 font-semibold hover:text-slate-900 transition-colors"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reply Input Box */}
                {replyingToId === comment._id && currentUser && (
                  <div className="ml-10 flex items-start gap-2 animate-in fade-in duration-100">
                    <input
                      type="text"
                      placeholder={`Reply to ${comment.author?.name}...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleCreateReply(comment._id)}
                      disabled={!replyContent.trim() || submitting}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {/* Nested Threaded Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-10 space-y-2 border-l-2 border-blue-100 pl-3">
                    {comment.replies.map((reply) => {
                      const isReplyLiked = currentUser
                        ? reply.likes?.some((id) => id.toString() === currentUser._id.toString())
                        : false;
                      const isReplyAuthor = currentUser?._id === reply.author?._id;

                      return (
                        <div key={reply._id} className="flex items-start gap-2">
                          <img
                            src={
                              reply.author?.profileImage ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author?.name || 'User')}&background=2563eb&color=fff`
                            }
                            alt=""
                            className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0 mt-1"
                          />
                          <div className="flex-1 bg-white border border-slate-100 rounded-xl p-2.5 text-xs shadow-sm">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-slate-900 text-[11px]">
                                {reply.author?.name}
                              </span>
                              {isReplyAuthor && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(reply._id, true, comment._id)
                                  }
                                  className="text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-slate-800 leading-relaxed text-[11px]">
                              {reply.content}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <button
                                onClick={() => handleLikeComment(reply._id, true, comment._id)}
                                className={`flex items-center gap-1 font-semibold ${
                                  isReplyLiked ? 'text-blue-600' : 'hover:text-slate-700'
                                }`}
                              >
                                <Heart
                                  className={`w-3 h-3 ${isReplyLiked ? 'fill-blue-600' : ''}`}
                                />
                                <span>{reply.likes?.length || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

