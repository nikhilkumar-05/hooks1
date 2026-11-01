import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Users, Sparkles, Building2, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LeftSidebar: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <aside className="w-full space-y-4">
      {/* User Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        {/* Cover Banner */}
        <div className="h-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-4 pt-0 relative text-center">
          <Link to={`/profile/${currentUser._id}`} className="inline-block relative -mt-9 group">
            <img
              src={
                currentUser.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff`
              }
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform"
            />
          </Link>

          <Link
            to={`/profile/${currentUser._id}`}
            className="block text-base font-bold text-slate-900 hover:text-blue-600 transition-colors mt-1"
          >
            {currentUser.name}
          </Link>

          <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5 line-clamp-2">
            {currentUser.headline || `${currentUser.course} · Lovely Professional University`}
          </p>

          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200/60">
            <span>{currentUser.semester}</span>
            <span>•</span>
            <span>{currentUser.course}</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
            <Link to="/network" className="hover:text-blue-600 transition-colors">
              <span className="font-bold text-slate-900 block">{currentUser.following?.length || 0}</span>
              <span className="text-slate-500 text-[11px]">Following</span>
            </Link>
            <div className="w-px h-6 bg-slate-200" />
            <Link to="/network" className="hover:text-blue-600 transition-colors">
              <span className="font-bold text-slate-900 block">{currentUser.followers?.length || 0}</span>
              <span className="text-slate-500 text-[11px]">Followers</span>
            </Link>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100">
            <Link
              to="/saved"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-slate-400" />
              <span>Saved Campus Posts</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Campus Quick Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Campus Shortcuts
        </h3>
        <nav className="space-y-1">
          <Link
            to="/network"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Find Students</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Connect</span>
          </Link>
          <Link
            to="/clubs"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Student Clubs</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Explore</span>
          </Link>
          <Link
            to="/events"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Campus Events</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">RSVP</span>
          </Link>
        </nav>

        {/* AI Campus Safety Badge */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Protected by LPU Hooks AI Moderation</span>
        </div>
      </div>
    </aside>
  );
};

