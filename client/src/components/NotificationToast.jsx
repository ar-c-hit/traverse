import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, UserPlus, Users, MessageSquare, Compass, Sparkles, X, ArrowRight } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationToast = () => {
  const { toastNotification, dismissToast, markAsRead } = useNotification();
  const navigate = useNavigate();

  if (!toastNotification) return null;

  const handleClick = () => {
    if (toastNotification.id) {
      markAsRead(toastNotification.id);
    }
    dismissToast();
    if (toastNotification.link) {
      navigate(toastNotification.link);
    }
  };

  const getIcon = () => {
    switch (toastNotification.type) {
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'like_trip':
        return <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />;
      case 'join_trip':
        return <Compass className="w-3.5 h-3.5 text-amber-400" />;
      case 'message':
        return <MessageSquare className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-brand-400" />;
    }
  };

  return (
    <div className="fixed top-24 right-4 sm:right-8 z-[100] max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div 
        onClick={handleClick}
        className="bg-slate-900/95 border border-slate-700/80 hover:border-brand-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3 cursor-pointer group transition-all hover:scale-[1.02]"
      >
        {/* Avatar or Icon */}
        <div className="relative flex-shrink-0">
          {toastNotification.avatar ? (
            <img
              src={toastNotification.avatar}
              alt="Sender"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-xs">
            {getIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-black text-white truncate">
              {toastNotification.title}
            </h4>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-snug">
            {toastNotification.message}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-brand-400 group-hover:text-brand-300 mt-1.5">
            <span>Tap to view</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;

