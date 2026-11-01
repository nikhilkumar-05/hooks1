import React, { useState, useEffect } from 'react';
import { LeftSidebar } from '../components/layout/LeftSidebar';
import { RightSidebar } from '../components/layout/RightSidebar';
import { PostComposer } from '../components/feed/PostComposer';
import { PostCard } from '../components/feed/PostCard';
import { Post } from '../types';
import { postService } from '../services/api';
import { Sparkles, Bookmark, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  initialFilter?: 'saved' | 'following';
}

export const HomePage: React.FC<HomePageProps> = ({ initialFilter }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'saved'>(
    initialFilter || 'all'
  );

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const filter = activeTab === 'all' ? undefined : activeTab;
      const res = await postService.getPosts({ filter });
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column (Desktop 3 cols) */}
        <div className="hidden md:block md:col-span-3 sticky top-20">
          <LeftSidebar />
        </div>

        {/* Center Feed Column (Desktop 6 cols) */}
        <main className="col-span-1 md:col-span-6 space-y-4">
          {/* Post Composer */}
          <PostComposer onPostCreated={handlePostCreated} />

          {/* Feed Filter Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Campus Feed</span>
              </button>

              {currentUser && (
                <>
                  <button
                    onClick={() => setActiveTab('following')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      activeTab === 'following'
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Following</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      activeTab === 'saved'
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </button>
                </>
              )}
            </div>

            <button
              onClick={fetchPosts}
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
              title="Refresh Feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 animate-pulse shadow-subtle"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                  </div>
                  <div className="h-44 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center shadow-subtle">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No posts to display</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {activeTab === 'saved'
                  ? 'You have not saved any campus posts yet. Click the bookmark icon on any post to save it for later.'
                  : activeTab === 'following'
                  ? 'You are not following any students yet, or they haven’t posted recently. Visit the Network tab to follow your peers!'
                  : 'Be the first to share your projects, experiences, or ideas with the LPU community!'}
              </p>
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          )}
        </main>

        {/* Right Column (Desktop 3 cols) */}
        <div className="hidden md:block md:col-span-3 sticky top-20">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

