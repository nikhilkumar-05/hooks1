import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Share2,
  Trash2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Post } from '../../types';
import { postService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState<boolean>(
    post.isLiked ?? (currentUser ? post.likes.includes(currentUser._id) : false)
  );
  const [likeCount, setLikeCount] = useState<number>(post.likes?.length || 0);
  const [isSaved, setIsSaved] = useState<boolean>(
    post.isSaved ?? (currentUser ? (currentUser.savedPosts?.includes(post._id) || false) : false)
  );
  const [commentCount, setCommentCount] = useState<number>(post.commentCount || 0);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const isAuthor = currentUser?._id === post.author?._id;

  const handleToggleLike = async () => {
    if (!currentUser) return;
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextState) {
        await postService.likePost(post._id);
      } else {
        await postService.unlikePost(post._id);
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic state
      setIsLiked(!nextState);
      setLikeCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleToggleSave = async () => {
    if (!currentUser) return;
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      await postService.toggleSavePost(post._id);
    } catch (err) {
      console.error(err);
      setIsSaved(!nextSaved);
    }
  };

  const handleShare = async () => {
    const shareText = `${post.author?.name} on LPU Hooks: "${post.content.slice(0, 100)}..."`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LPU Hooks Campus Post',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${window.location.origin}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campus post?')) return;
    setIsDeleting(true);
    try {
      await postService.deletePost(post._id);
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-4 sm:p-5 mb-4 transition-all hover:border-slate-300/80">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link to={`/profile/${post.author?._id}`} className="group shrink-0">
            <img
              src={
                post.author?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Student')}&background=2563eb&color=fff`
              }
              alt={post.author?.name}
              className="w-11 h-11 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
            />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/profile/${post.author?._id}`}
                className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
              >
                {post.author?.name || 'Anonymous Student'}
              </Link>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200/60 rounded">
                LPU
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
              {post.author?.headline || `${post.author?.course || 'Student'} · ${post.author?.semester || ''}`}
            </p>
            <span className="text-[10px] text-slate-400 block mt-0.5">{formattedDate}</span>
          </div>
        </div>

        {/* Right Header: Delete or AI Verified badge */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Verified</span>
          </div>
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-3.5 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
        {post.content.split(/(\s+)/).map((word, index) => {
          if (word.startsWith('#')) {
            return (
              <span key={index} className="text-blue-600 font-semibold hover:underline cursor-pointer">
                {word}
              </span>
            );
          }
          return word;
        })}
      </div>

      {/* Image attachment */}
      {post.imageUrl && (
        <div className="mt-3.5 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 max-h-[420px]">
          <img
            src={post.imageUrl}
            alt="Campus post media"
            className="w-full h-auto max-h-[420px] object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Engagement Stats row matching reference */}
      <div className="mt-3.5 pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] shadow-sm">
            <ThumbsUp className="w-2.5 h-2.5" />
          </span>
          <span className="font-semibold text-slate-700">{likeCount}</span>
          <span>{likeCount === 1 ? 'like' : 'likes'}</span>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:text-blue-600 transition-colors"
        >
          <span>{commentCount}</span> {commentCount === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {/* Action Buttons bar matching reference design (Like, Comment, Share, Save) */}
      <div className="mt-2 pt-1 border-t border-slate-100 grid grid-cols-4 gap-1 text-xs">
        {/* Like Button */}
        <button
          onClick={handleToggleLike}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition-colors ${
            isLiked ? 'text-blue-600 bg-blue-50/70' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-blue-600' : ''}`} />
          <span>Like</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition-colors ${
            showComments ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleToggleSave}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition-colors ${
            isSaved ? 'text-amber-600 bg-amber-50/70' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {/* Threaded Comments Section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          onCommentCountChange={(count) => setCommentCount(count)}
        />
      )}
    </article>
  );
};

