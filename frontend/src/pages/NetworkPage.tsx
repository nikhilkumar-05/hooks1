import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  Check,
  UserCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import { userService } from '../services/api';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';

export const NetworkPage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'connections'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, connRes] = await Promise.all([
        userService.getUsers({ q: searchQuery || undefined }),
        userService.getMyConnections(),
      ]);
      setUsers(usersRes.data || []);
      setConnections(connRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleConnect = async (userId: string) => {
    try {
      const res = await userService.toggleConnection(userId);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isConnected: res.data.connected } : u))
      );
      // Reload connections
      const connRes = await userService.getMyConnections();
      setConnections(connRes.data || []);
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFollow = async (userId: string) => {
    try {
      const res = await userService.toggleFollow(userId);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isFollowing: res.data.following } : u))
      );
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">Campus Student Network</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect with fellow peers, branch mates, and campus club leaders across Lovely Professional University.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'discover'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Discover Students
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'connections'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              My Connections ({connections.length})
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name, course, semester, or technical skill (e.g., Python, React, AI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Grid of Students */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200/90 h-64 p-4 animate-pulse"
            />
          ))}
        </div>
      ) : activeTab === 'connections' ? (
        // Connections List
        connections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-subtle">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No active connections yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Switch to "Discover Students" above to send connection requests and build your campus network!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {connections.map((student) => (
              <div
                key={student._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 flex flex-col items-center text-center hover:border-blue-300 transition-all"
              >
                <img
                  src={
                    student.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=2563eb&color=fff`
                  }
                  alt={student.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md mb-3"
                />
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{student.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {student.headline || `${student.course} · ${student.semester}`}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-2">
                  <Link
                    to={`/profile/${student._id}`}
                    className="flex-1 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleToggleConnect(student._id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Discover Students
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {users
            .filter((u) => u._id !== currentUser?._id)
            .map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                {/* Cover and Avatar */}
                <div>
                  <div className="h-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative" />
                  <div className="px-5 pt-0 pb-4 text-center -mt-9">
                    <Link to={`/profile/${user._id}`} className="inline-block group">
                      <img
                        src={
                          user.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`
                        }
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md mx-auto group-hover:scale-105 transition-transform"
                      />
                    </Link>

                    <Link
                      to={`/profile/${user._id}`}
                      className="block text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-2"
                    >
                      {user.name}
                    </Link>

                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                      {user.headline || `${user.course} · ${user.semester}`}
                    </p>

                    <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50">
                      {user.course}
                    </span>

                    {/* Skills pills */}
                    {user.skills && user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mt-3">
                        {user.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skills.length > 3 && (
                          <span className="text-[10px] px-1 text-slate-400">
                            +{user.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions: Connect + Follow */}
                <div className="p-4 pt-0 border-t border-slate-100 mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleToggleConnect(user._id)}
                    className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                      user.isConnected
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    {user.isConnected ? (
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
                    onClick={() => handleToggleFollow(user._id)}
                    className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold border transition-colors ${
                      user.isFollowing
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : '+ Follow'}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
