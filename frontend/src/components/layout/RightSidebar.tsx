import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Calendar, UserPlus, Check, ChevronRight } from 'lucide-react';
import { Club, Event, User } from '../../types';
import { clubService, eventService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const RightSidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWidgetsData = async () => {
      try {
        const [usersRes, clubsRes, eventsRes] = await Promise.all([
          userService.getUsers(),
          clubService.getClubs(),
          eventService.getEvents(),
        ]);

        const filteredUsers = (usersRes.data || [])
          .filter((u: User) => u._id !== currentUser?._id)
          .slice(0, 3);
        setSuggestedUsers(filteredUsers);
        setClubs((clubsRes.data || []).slice(0, 3));
        setEvents((eventsRes.data || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load right sidebar widgets:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWidgetsData();
  }, [currentUser]);

  const handleToggleConnect = async (userId: string) => {
    try {
      const res = await userService.toggleConnection(userId);
      setSuggestedUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isConnected: res.data.connected } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleClub = async (club: Club) => {
    if (!currentUser) return;
    const isMember = club.members.includes(currentUser._id);
    try {
      if (isMember) {
        const res = await clubService.leaveClub(club._id);
        setClubs((prev) => prev.map((c) => (c._id === club._id ? res.data : c)));
      } else {
        const res = await clubService.joinClub(club._id);
        setClubs((prev) => prev.map((c) => (c._id === club._id ? res.data : c)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRsvp = async (event: Event) => {
    if (!currentUser) return;
    const isAttending = event.attendees.includes(currentUser._id);
    try {
      if (isAttending) {
        const res = await eventService.cancelRsvp(event._id);
        setEvents((prev) => prev.map((e) => (e._id === event._id ? res.data : e)));
      } else {
        const res = await eventService.rsvpEvent(event._id);
        setEvents((prev) => prev.map((e) => (e._id === event._id ? res.data : e)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <aside className="w-full space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl border border-slate-200/90 h-48 p-4" />
        <div className="bg-white rounded-2xl border border-slate-200/90 h-48 p-4" />
      </aside>
    );
  }

  return (
    <aside className="w-full space-y-4">
      {/* Suggested Connections Widget matching reference layout */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">My Network</h3>
          </div>
          <Link
            to="/network"
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center"
          >
            All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <p className="text-xs text-slate-500 mb-3">Connect with students across LPU</p>

        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user._id} className="flex items-center justify-between gap-2.5">
              <Link to={`/profile/${user._id}`} className="flex items-center gap-2.5 min-w-0 flex-1 group">
                <img
                  src={
                    user.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`
                  }
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate leading-tight">
                    {user.course || 'B.Tech CSE'}
                  </p>
                </div>
              </Link>

              <button
                onClick={() => handleToggleConnect(user._id)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all shrink-0 ${
                  user.isConnected
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}
              >
                {user.isConnected ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Hooked</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Connect</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Clubs Widget matching reference layout */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Campus Clubs</h3>
          </div>
          <Link
            to="/clubs"
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center"
          >
            All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <p className="text-xs text-slate-500 mb-3">Explore university clubs & societies</p>

        <div className="space-y-3">
          {clubs.map((club) => {
            const isMember = currentUser ? club.members.includes(currentUser._id) : false;
            return (
              <div key={club._id} className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{club.name}</h4>
                  <span className="text-[10px] text-indigo-600 font-semibold">{club.category}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">{club.members.length} members</span>
                  <button
                    onClick={() => handleToggleClub(club)}
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold transition-colors ${
                      isMember
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isMember ? 'Joined' : 'Join'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Events Widget matching reference layout */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Campus Events</h3>
          </div>
          <Link
            to="/events"
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center"
          >
            All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <p className="text-xs text-slate-500 mb-3">Join upcoming campus hackathons & fests</p>

        <div className="space-y-3">
          {events.map((event) => {
            const isAttending = currentUser ? event.attendees.includes(currentUser._id) : false;
            const eventDate = new Date(event.eventDate);
            const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
            const day = eventDate.getDate();

            return (
              <div key={event._id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/70 flex flex-col items-center justify-center shrink-0 text-center">
                  <span className="text-[9px] font-bold text-purple-600 leading-none">{month}</span>
                  <span className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">{day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">{event.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{event.venue}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-slate-400">{event.attendees.length} RSVPs</span>
                    <button
                      onClick={() => handleToggleRsvp(event)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        isAttending
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {isAttending ? 'RSVP\'d' : 'RSVP'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

