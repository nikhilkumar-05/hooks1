import React, { useState, useEffect } from 'react';
import {
  Radio,
  Users,
  Video,
  X,
  Plus,
  Heart,
  Flame,
  Send,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { LiveSession } from '../../types';
import { liveService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const CampusLiveSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Active watching session modal
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [reactions, setReactions] = useState<{ id: number; emoji: string }[]>([]);
  const [liveChatMessages, setLiveChatMessages] = useState<
    { id: string; user: string; text: string; time: string }[]
  >([]);
  const [chatInput, setChatInput] = useState('');

  // Start live session modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<any>('Campus Discussion');
  const [newTags, setNewTags] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchLive = async () => {
    try {
      const res = await liveService.getLiveSessions();
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load live sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenLive = async (session: LiveSession) => {
    setActiveSession(session);
    setViewerCount(session.viewersCount + 1);
    setLiveChatMessages([
      { id: '1', user: 'Priya Patel', text: 'Hey everyone! Glad this live room is on!', time: 'now' },
      { id: '2', user: 'Aman Sharma', text: 'Audio and stage are crystal clear!', time: 'now' },
    ]);
    try {
      await liveService.joinLiveSession(session._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReaction = (emoji: string) => {
    const reactionId = Date.now() + Math.random();
    setReactions((prev) => [...prev, { id: reactionId, emoji }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== reactionId));
    }, 2000);
  };

  const handleSendLiveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;
    setLiveChatMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        user: currentUser.name,
        text: chatInput.trim(),
        time: 'now',
      },
    ]);
    setChatInput('');
  };

  const handleCreateLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    setCreateError(null);

    try {
      const res = await liveService.createLiveSession({
        title: newTitle.trim(),
        category: newCategory,
        tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      setSessions((prev) => [res.data, ...prev]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewTags('');
      // Immediately open room for host
      handleOpenLive(res.data);
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Failed to start live room.');
    } finally {
      setCreating(false);
    }
  };

  const handleEndLive = async (id: string) => {
    try {
      await liveService.endLiveSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      setActiveSession(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && sessions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-3.5 sm:p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
          </span>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            Campus Live Broadcasts
          </h2>
          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {sessions.length} Active
          </span>
        </div>

        {currentUser && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded-full shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Go Live</span>
          </button>
        )}
      </div>

      {/* Horizontal Live Rooms Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {sessions.map((session) => (
          <div
            key={session._id}
            onClick={() => handleOpenLive(session)}
            className="w-56 shrink-0 rounded-2xl border border-slate-200/90 p-3 bg-gradient-to-br from-slate-50 to-white hover:border-rose-400 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
          >
            {/* Top Tag & Viewer badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white/90 px-1.5 py-0.5 rounded-md border border-slate-200">
                <Users className="w-3 h-3 text-slate-400" />
                {session.viewersCount}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors">
              {session.title}
            </h3>

            {/* Host row */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
              <img
                src={
                  session.host?.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(session.host?.name || 'Host')}&background=2563eb&color=fff`
                }
                alt=""
                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-800 truncate">
                  {session.host?.name || 'Student Host'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {session.category}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE LIVE ROOM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-orange-50">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">Go Live on LPU Hooks</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLive} className="p-5 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Live Stream Topic / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🔴 Coding Ninjas Badminton Match Commentary or Q&A"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Campus Discussion">Campus Discussion & Issues</option>
                  <option value="Club AMA">Club AMA & Hiring</option>
                  <option value="Sports & Gaming">Sports & Gaming Tournaments</option>
                  <option value="Tech Talk">Tech Talk & Coding Sprints</option>
                  <option value="Study With Me">Late Night Study With Me</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Badminton, CodingNinjas, Block33, Library"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-500/20 disabled:opacity-50"
                >
                  {creating ? 'Launching...' : 'Start Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVE LIVE BROADCAST VIEWER ROOM */}
      {activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col h-[85vh] relative animate-in zoom-in-95 duration-150">
            {/* Top Stage Bar */}
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE STAGE
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{activeSession.title}</h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    Hosted by {activeSession.host?.name} · {activeSession.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                  <span>{viewerCount} in room</span>
                </span>
                {currentUser?._id === activeSession.host?._id && (
                  <button
                    onClick={() => handleEndLive(activeSession._id)}
                    className="text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 px-3 py-1 rounded-full transition-colors"
                  >
                    End Stream
                  </button>
                )}
                <button
                  onClick={() => setActiveSession(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Live Visual Stage (Simulated Broadcast Room) */}
            <div className="flex-1 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 flex flex-col justify-between relative overflow-hidden">
              {/* Floating animated reactions */}
              <div className="absolute right-8 bottom-20 pointer-events-none space-y-2 flex flex-col items-end">
                {reactions.map((r) => (
                  <span
                    key={r.id}
                    className="text-3xl animate-bounce transition-all duration-1000 transform -translate-y-12"
                  >
                    {r.emoji}
                  </span>
                ))}
              </div>

              {/* Stage Speakers Display */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="relative inline-block">
                    <img
                      src={
                        activeSession.host?.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(activeSession.host?.name || 'Host')}&background=2563eb&color=fff`
                      }
                      alt=""
                      className="w-24 h-24 rounded-full object-cover border-4 border-rose-500 shadow-xl shadow-rose-500/20 mx-auto"
                    />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                      <Radio className="w-2.5 h-2.5 animate-pulse" /> SPEAKING
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{activeSession.host?.name}</h4>
                    <p className="text-xs text-slate-400">
                      {activeSession.host?.headline || `${activeSession.host?.course} · LPU`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Public Chat Box overlay */}
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-3 max-h-40 overflow-y-auto space-y-1.5 text-xs">
                {liveChatMessages.map((msg) => (
                  <div key={msg.id} className="flex items-baseline gap-2">
                    <span className="font-bold text-rose-400 shrink-0">{msg.user}:</span>
                    <span className="text-slate-200">{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Interaction Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
              <form onSubmit={handleSendLiveMessage} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Drop a question or message to the campus live..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Reaction Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSendReaction('❤️')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-xl transition-transform hover:scale-110"
                >
                  ❤️
                </button>
                <button
                  type="button"
                  onClick={() => handleSendReaction('👏')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xl transition-transform hover:scale-110"
                >
                  👏
                </button>
                <button
                  type="button"
                  onClick={() => handleSendReaction('🔥')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-amber-950 text-xl transition-transform hover:scale-110"
                >
                  🔥
                </button>
                <button
                  type="button"
                  onClick={() => handleSendReaction('🏸')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-950 text-xl transition-transform hover:scale-110"
                >
                  🏸
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

