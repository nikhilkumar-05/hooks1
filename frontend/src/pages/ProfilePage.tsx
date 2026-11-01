import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Edit3,
  UserPlus,
  Check,
  MapPin,
  GraduationCap,
  Sparkles,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { User, Post } from '../types';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/feed/PostCard';
import { EditProfileModal } from '../components/profile/EditProfileModal';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, refreshUser } = useAuth();

  const targetId = id || currentUser?._id;
  const isSelf = currentUser?._id === targetId;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProfile = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const res = await userService.getUserById(targetId);
      setProfileUser(res.data.user);
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  const handleToggleConnect = async () => {
    if (!profileUser || isSelf) return;
    try {
      const res = await userService.toggleConnection(profileUser._id);
      setProfileUser((prev) => (prev ? { ...prev, isConnected: res.data.connected } : null));
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFollow = async () => {
    if (!profileUser || isSelf) return;
    try {
      const res = await userService.toggleFollow(profileUser._id);
      setProfileUser((prev) => (prev ? { ...prev, isFollowing: res.data.following } : null));
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="bg-white rounded-2xl h-72 border border-slate-200" />
        <div className="bg-white rounded-2xl h-44 border border-slate-200" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Student Profile Not Found</h2>
        <Link to="/" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Return to campus feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-5">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        {/* Cover Image */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        {/* Info */}
        <div className="px-5 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <img
                src={
                  profileUser.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=2563eb&color=fff`
                }
                alt={profileUser.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg bg-white"
              />
              <div className="sm:mb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{profileUser.name}</h1>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                    LPU Student
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  {profileUser.headline || `${profileUser.course} · Lovely Professional University`}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-blue-700">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {profileUser.course} ({profileUser.semester})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    LPU Main Campus, Phagwara, Punjab
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Edit vs Connect */}
            <div className="flex items-center gap-2 shrink-0">
              {isSelf ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleToggleConnect}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      profileUser.isConnected
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    {profileUser.isConnected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleToggleFollow}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      profileUser.isFollowing
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {profileUser.isFollowing ? 'Following' : '+ Follow'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          {profileUser.bio && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">About</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {profileUser.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {profileUser.skills && profileUser.skills.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Technical Skills & Tools
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profileUser.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {isSelf ? 'My Campus Posts' : `${profileUser.name}'s Posts`} ({posts.length})
            </h2>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-subtle">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No campus posts shared yet.</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={(deletedId) => setPosts((prev) => prev.filter((p) => p._id !== deletedId))}
            />
          ))
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          onClose={() => setShowEditModal(false)}
          onUpdated={(updated) => setProfileUser(updated)}
        />
      )}
    </div>
  );
};

