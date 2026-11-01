import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Link as LinkIcon,
  Search,
  Home,
  Users,
  Building2,
  Calendar,
  Bell,
  Bookmark,
  LogOut,
  User as UserIcon,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService, userService } from '../../services/api';
import { NotificationItem } from '../../types';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await userService.getUsers({ q: searchQuery });
        setSearchResults(res.data.slice(0, 5));
        setShowSearchDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const markAllRead = async () => {
    try {
      await notificationService.markAsRead('all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/network', label: 'My Network', icon: Users },
    { to: '/clubs', label: 'Clubs', icon: Building2 },
    { to: '/events', label: 'Events', icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-subtle">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Brand Logo matching the reference screenshot */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <LinkIcon className="w-5 h-5 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    Hooks
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 hidden md:inline-block">
                    Campus
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 leading-none mt-1 hidden sm:inline-block">
                  LPU Campus Network
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search people, clubs, and events"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchDropdown(true)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Live Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-hover border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <span>Student Search Results</span>
                  {isSearching && <span className="animate-pulse">Searching...</span>}
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No students found matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {searchResults.map((user) => (
                      <Link
                        key={user._id}
                        to={`/profile/${user._id}`}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-blue-50/60 transition-colors"
                      >
                        <img
                          src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user.course} · {user.semester}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Notifications Button */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showNotifications
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Bell className="w-5 h-5 mb-0.5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-3 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-hover border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">No notifications yet</p>
                        <p className="text-slate-400 mt-0.5">Likes, comments, and campus connections will appear here.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                            !notif.read ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <img
                            src={
                              notif.sender?.profileImage ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.sender?.name || 'Student')}&background=2563eb&color=fff`
                            }
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-800 leading-snug">
                              <span className="font-bold text-slate-900">{notif.sender?.name}</span>{' '}
                              {notif.message.replace(notif.sender?.name || '', '')}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative border-l border-slate-200 pl-2 sm:pl-3 ml-1" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-100 transition-all"
              >
                <img
                  src={
                    currentUser?.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Me')}&background=2563eb&color=fff`
                  }
                  alt={currentUser?.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-hover border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                    <div className="mt-2 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                      {currentUser?.course} · {currentUser?.semester}
                    </div>
                  </div>

                  <div className="p-1.5">
                    <Link
                      to={`/profile/${currentUser?._id}`}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      View Profile
                    </Link>
                    <Link
                      to="/saved"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-slate-500" />
                      Saved Posts
                    </Link>
                  </div>

                  <div className="p-1.5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Right Icons */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 relative rounded-lg"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <Link to={`/profile/${currentUser?._id}`} className="p-1">
              <img
                src={
                  currentUser?.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Me')}&background=2563eb&color=fff`
                }
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

