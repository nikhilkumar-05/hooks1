import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Building2, Calendar, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/network', label: 'Network', icon: Users },
    { to: '/clubs', label: 'Clubs', icon: Building2 },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: currentUser ? `/profile/${currentUser._id}` : '/login', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3 flex justify-around items-center shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

