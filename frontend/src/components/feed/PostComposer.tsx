import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  X,
  Send,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/api';
import { Post } from '../../types';

interface PostComposerProps {
  onPostCreated: (post: Post) => void;
}

const SAMPLE_CAMPUS_IMAGES = [
  {
    label: 'Campus Life',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Hackathon & Dev',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'AI & Robotics',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Workshop & Hall',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  },
];

// Instant client-side AI safety rules
function fastCheckContent(text: string, img: string): { blocked: boolean; reason?: string } {
  if (!text && !img) return { blocked: false };
  const raw = text.toLowerCase();
  const normalized = raw
    .replace(/[@]/g, 'a')
    .replace(/[\$]/g, 's')
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[*_~`\-\.]/g, '')
    .replace(/(.)\1+/g, '$1')
    .trim();
  const spaceless = normalized.replace(/\s+/g, '');

  const profanitySexualRegex = /\b(?:f+u+c+k\w*|f+k\b|f+u+k\w*|f+c+k\w*|p+h+u+c+k\w*|b+i+t+c+h\w*|s+l+u+t\w*|w+h+o+r+e\w*|c+u+n+t\w*|b+a+s+t+a+r+d\w*|a+s+s+h+o+l+e\w*|p+o+r+n\w*|n+u+d+e\w*|n+a+k+e+d\w*|b+o+o+b\w*|t+i+t\w*|t+i+t+s|d+i+c+k\w*|c+o+c+k\w*|p+u+s+s+y\w*|v+a+g+i+n+a\w*|p+e+n+i+s\w*|m+a+s+t+u+r+b\w*|o+r+g+a+s+m\w*|e+r+o+t+i+c\w*|h+e+n+t+a+i|x+x+x|x+v+i+d+e+o+s|p+o+r+n+h+u+b|o+n+l+y+f+a+n+s|d+i+l+d+o|b+l+o+w+j+o+b|a+n+a+l|t+h+r+e+e+s+o+m+e|s+e+x\b|s+e+x+y)\b/i;
  const hateRegex = /\b(?:faggot\w*|nigger\w*|nigga\w*|chamar\w*|bhangi\w*|jihadi\w*|katuwa\w*|retard\w*|subhuman|hate\s+(?:all\s+)?(?:muslims|hindus|sikhs|christians|dalits|biharis|punjabis|blacks|whites|gays|lesbians))\b/i;
  const abusiveHindi = /\b(?:c+h+u+t+i+y+a\w*|c+h+o+d+u\w*|b+h+o+s+d+i\w*|b+h+o+s+d+i+k+e\w*|m+a+d+a+r+c+h+o+d\w*|b+e+h+e+n+c+h+o+d\w*|r+a+n+d+i\w*|g+a+n+d\w*|g+a+a+n+d\w*|l+u+n+d\w*|l+o+d+u\w*|h+a+r+a+m+i\w*|c+h+u+t\b|k+a+m+i+n+e\w*|s+a+l+a\b|s+a+a+l+a\b)\b/i;
  const violenceRegex = /\b(?:kill\s+(?:you|him|her|them|everyone)|murder|shoot\s+(?:you|him|her)|bomb|stab|strangle|assassinate|slit\s+(?:your|his|her)\s+throat|beat\s+you\s+(?:up|to\s+death)|commit\s+suicide)\b/i;
  const raggingRegex = /\b(?:rag(?:ging)?\s+(?:freshers?|juniors?)|junior\s+ragging|humiliate\s+freshers?|seniors?\s+will\s+torture\s+you|forced\s+intro\s+session|strip\s+juniors?|hostel\s+ragging)\b/i;

  if (
    profanitySexualRegex.test(raw) ||
    profanitySexualRegex.test(normalized) ||
    profanitySexualRegex.test(spaceless) ||
    /\bf[\*\._\-\s]*[uck]+k/i.test(raw) ||
    /\bfck\b/i.test(normalized)
  ) {
    return {
      blocked: true,
      reason: 'Prohibited: Vulgarity, profanity, and sexually explicit language violate university community standards.',
    };
  }

  if (hateRegex.test(raw) || hateRegex.test(normalized) || hateRegex.test(spaceless)) {
    return {
      blocked: true,
      reason: 'Prohibited: Hate speech, derogatory slurs, casteism, and discrimination are strictly forbidden at LPU.',
    };
  }

  if (abusiveHindi.test(raw) || abusiveHindi.test(normalized) || abusiveHindi.test(spaceless)) {
    return {
      blocked: true,
      reason: 'Prohibited: Abusive, vulgar, or derogatory campus slang violates community standards.',
    };
  }

  if (violenceRegex.test(raw) || violenceRegex.test(normalized)) {
    return {
      blocked: true,
      reason: 'Prohibited: Threatening violence, injury, or bodily harm is strictly forbidden.',
    };
  }

  if (raggingRegex.test(raw) || raggingRegex.test(normalized)) {
    return {
      blocked: true,
      reason: 'Prohibited: Lovely Professional University has a strict zero-tolerance anti-ragging policy.',
    };
  }

  if (img) {
    const cleanImg = img.toLowerCase();
    if (/(?:porn|xxx|nude|naked|nsfw|erotic|hentai|boob|fetish|lewd|sex)/i.test(cleanImg)) {
      return {
        blocked: true,
        reason: 'Prohibited: Attached media URL contains explicit or NSFW markers.',
      };
    }
  }

  return { blocked: false };
}

export const PostComposer: React.FC<PostComposerProps> = ({ onPostCreated }) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);

  // Live AI Detection States
  const [aiStatus, setAiStatus] = useState<'clean' | 'flagged' | 'blocked' | 'checking'>('clean');
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [moderationNotice, setModerationNotice] = useState<string | null>(null);

  if (!currentUser) return null;

  // Real-time AI detection scan on every change
  useEffect(() => {
    if (!content.trim() && !imageUrl.trim()) {
      setAiStatus('clean');
      setAiReason(null);
      return;
    }

    // 1. Instant 0ms synchronous check
    const fastCheck = fastCheckContent(content, imageUrl);
    if (fastCheck.blocked) {
      setAiStatus('blocked');
      setAiReason(fastCheck.reason || 'Content violates LPU campus safety policies.');
      return;
    }

    // 2. Server asynchronous precheck as secondary confirmation
    const timer = setTimeout(async () => {
      try {
        const res = await postService.precheckPost({
          content: content.trim(),
          imageUrl: imageUrl.trim() || undefined,
        });

        if (res.data.decision === 'REJECTED') {
          setAiStatus('blocked');
          setAiReason(res.data.reason || 'Violates LPU campus standards against hate speech or sexual content.');
        } else if (res.data.decision === 'REVIEW_REQUIRED') {
          setAiStatus('flagged');
          setAiReason(res.data.reason || 'Content contains sensitive keywords and will require review.');
        } else {
          setAiStatus('clean');
          setAiReason(null);
        }
      } catch (err) {
        // Keep fast check state
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [content, imageUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading || aiStatus === 'blocked') return;

    // Double check fast rules
    const fastCheck = fastCheckContent(content, imageUrl);
    if (fastCheck.blocked) {
      setAiStatus('blocked');
      setAiReason(fastCheck.reason || 'Content violates LPU campus safety policies.');
      return;
    }

    setLoading(true);
    setModerationError(null);
    setModerationNotice(null);

    try {
      const res = await postService.createPost({
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      if (res.status === 202) {
        setModerationNotice(res.data.message || 'Post submitted and pending campus safety review.');
        setContent('');
        setImageUrl('');
        setShowImageInput(false);
        setTimeout(() => {
          setIsOpen(false);
          setModerationNotice(null);
        }, 3000);
      } else {
        onPostCreated(res.data);
        setContent('');
        setImageUrl('');
        setShowImageInput(false);
        setIsOpen(false);
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setModerationError(
          err.response.data?.error || 'Post blocked: Violates LPU Hooks campus safety guidelines.'
        );
      } else {
        setModerationError(err.response?.data?.error || 'Failed to publish post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-3.5 sm:p-4 mb-4">
      {/* Top collapsed row matching reference screenshot */}
      <div className="flex items-center gap-3">
        <img
          src={
            currentUser.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff`
          }
          alt={currentUser.name}
          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
        />
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 text-left px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-500 text-xs sm:text-sm font-medium transition-colors border border-transparent hover:border-slate-300"
        >
          Share your projects, campus experiences, and ideas with the LPU community...
        </button>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 px-1">
        <button
          onClick={() => {
            setIsOpen(true);
            setShowImageInput(true);
          }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 py-1 px-2.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ImageIcon className="w-4 h-4 text-blue-500" />
          <span>Add Media</span>
        </button>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 py-1 px-2.5 rounded-lg hover:bg-slate-50 transition-colors hidden sm:flex"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Campus Discussion</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Anti-Hate & Sexual Detection Active</span>
        </div>
      </div>

      {/* Expanded Modal / Composer Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    currentUser.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff`
                  }
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{currentUser.name}</h3>
                  <p className="text-[11px] text-slate-500">Posting to LPU Hooks Campus Community</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setModerationError(null);
                  setModerationNotice(null);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5">
              {/* LIVE AI DETECTION STATUS BANNER */}
              {aiStatus === 'blocked' && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs animate-in fade-in duration-150">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-red-900">AI Safety Alert: Content Prohibited</p>
                    <p className="mt-0.5 leading-relaxed">{aiReason}</p>
                    <p className="mt-1 text-[11px] text-red-700 font-semibold">
                      Please remove hateful, sexual, or abusive language to enable posting.
                    </p>
                  </div>
                </div>
              )}

              {aiStatus === 'flagged' && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-800 text-xs animate-in fade-in duration-150">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-900">AI Safety Notice</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed">{aiReason}</p>
                  </div>
                </div>
              )}

              {/* Server Moderation Error Banner */}
              {moderationError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-red-900">Content Blocked by AI Safety Engine</p>
                    <p className="mt-0.5 leading-relaxed">{moderationError}</p>
                  </div>
                </div>
              )}

              {/* Moderation Pending Review Notice */}
              {moderationNotice && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-xs">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-900">Queued for Moderator Review</p>
                    <p className="mt-0.5">{moderationNotice}</p>
                  </div>
                </div>
              )}

              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you want to talk about with your fellow LPU students?"
                rows={5}
                className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none border-none p-0"
                autoFocus
              />

              {/* Image Preview */}
              {imageUrl && (
                <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 max-h-64 bg-slate-100">
                  <img src={imageUrl} alt="Post attachment" className="w-full h-full object-cover max-h-64" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Image URL Input or Quick Picker */}
              {showImageInput && !imageUrl && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Paste image URL (Unsplash, HTTPS, or web image)..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowImageInput(false)}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Quick select campus photo:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_CAMPUS_IMAGES.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => setImageUrl(img.url)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Live AI Detection Indicator Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Attach Image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <span className="text-xs text-slate-400">{content.length} / 3000</span>
                </div>

                {/* AI Detection Live Pill */}
                <div className="flex items-center gap-2">
                  {aiStatus === 'checking' && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                      <span>Scanning safety...</span>
                    </span>
                  )}
                  {aiStatus === 'clean' && content.trim() && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Safe & Approved</span>
                    </span>
                  )}
                  {aiStatus === 'blocked' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      <span>Violation Intercepted</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!content.trim() || loading || aiStatus === 'blocked'}
                    className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-md ${
                      aiStatus === 'blocked'
                        ? 'bg-red-500 cursor-not-allowed opacity-80'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Post to Hooks</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
