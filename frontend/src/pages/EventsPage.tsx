import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Check, Sparkles, Clock } from 'lucide-react';
import { Event } from '../types';
import { eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EventsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await eventService.getEvents();
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Campus Events & Hackathons</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Stay ahead of technical symposiums, hackathons, placement workshops, and cultural fests at LPU.
            </p>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200/90 h-52 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-subtle">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No upcoming events scheduled</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const isAttending = currentUser ? event.attendees.includes(currentUser._id) : false;
            const dateObj = new Date(event.eventDate);
            const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
            const day = dateObj.getDate();
            const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={event._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 flex flex-col justify-between hover:border-purple-300 transition-all"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    {/* Date Block */}
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/70 flex flex-col items-center justify-center shrink-0 text-center">
                      <span className="text-[10px] font-bold text-purple-600 leading-none">{month}</span>
                      <span className="text-base font-extrabold text-slate-900 leading-none mt-0.5">{day}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full inline-block mb-1">
                        Organized by {event.organizer}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{event.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{event.description}</p>

                  <div className="space-y-1.5 text-xs text-slate-500 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{dateObj.toDateString()} at {timeString}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.attendees.length} students attending</span>
                  </div>

                  <button
                    onClick={() => handleToggleRsvp(event)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isAttending
                        ? 'bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                    }`}
                  >
                    {isAttending ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>RSVP Confirmed</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>RSVP Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

