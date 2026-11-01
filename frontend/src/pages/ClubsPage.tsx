import React, { useState, useEffect } from 'react';
import { Building2, Users, Check, Plus, Sparkles, Filter } from 'lucide-react';
import { Club } from '../types';
import { clubService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ClubsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const fetchClubs = async () => {
    try {
      const res = await clubService.getClubs();
      setClubs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleToggleMembership = async (club: Club) => {
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

  const categories = ['All', ...new Set(clubs.map((c) => c.category))];

  const filteredClubs =
    selectedCategory === 'All'
      ? clubs
      : clubs.filter((c) => c.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Lovely Professional University Clubs</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Discover student chapters, coding guilds, robotics societies, and creative arts clubs on campus.
            </p>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200/90 h-44 animate-pulse" />
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-subtle">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No clubs found in this category</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClubs.map((club) => {
            const isMember = currentUser ? club.members.includes(currentUser._id) : false;

            return (
              <div
                key={club._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 flex flex-col justify-between hover:border-indigo-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {club.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Users className="w-3.5 h-3.5" />
                      <span>{club.members.length} members</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{club.name}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{club.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Est. LPU Campus Society
                  </span>

                  <button
                    onClick={() => handleToggleMembership(club)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isMember
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                  >
                    {isMember ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Joined</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Join Club</span>
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

