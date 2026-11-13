import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  PlusCircle, 
  Info, 
  Mail,
  ChevronDown,
  Sparkles,
  Bell,
  CheckCheck,
  Heart,
  UserPlus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useNotification } from '../context/NotificationContext';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return 'Just now';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getNotifIcon = (type) => {
  switch (type) {
    case 'follow':
      return <UserPlus className="w-2.5 h-2.5 text-emerald-400" />;
    case 'like_trip':
      return <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />;
    case 'join_trip':
      return <Compass className="w-2.5 h-2.5 text-amber-400" />;
    case 'message':
      return <MessageSquare className="w-2.5 h-2.5 text-sky-400" />;
    default:
      return <Sparkles className="w-2.5 h-2.5 text-brand-400" />;
  }
};

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { onlineCount } = useChat();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll
  } = useNotification();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns on route changes
  useEffect(() => {
    setNotifOpen(false);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifFilter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Trip Planner', path: '/planner' },
    { 
      name: 'Community', 
      path: '/community', 
      badge: 'Matching',
      badgeColor: isHomePage
        ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
    },
    { 
      name: 'Socials', 
      path: '/socials' 
    },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const headerClass = isHomePage
    ? scrolled
      ? 'sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/10 text-white transition-all duration-300 shadow-xl'
      : 'sticky top-0 z-50 bg-slate-950/35 backdrop-blur-sm border-b border-white/10 text-white transition-all duration-300 shadow-sm'
    : 'sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-sm';

  return (
    <header className={headerClass}>
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-14">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo on the Far Left */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-ocean-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-black tracking-tight ${
                isHomePage
                  ? 'text-white drop-shadow-sm'
                  : 'bg-gradient-to-r from-brand-800 via-brand-600 to-ocean-600 dark:from-brand-400 dark:via-brand-300 dark:to-ocean-400 bg-clip-text text-transparent'
              }`}>
                Traverse
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-widest -mt-1 ${
                isHomePage ? 'text-emerald-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                Traveler Network
              </span>
            </div>
          </Link>

          {/* Right Aligned Navigation & Actions Container */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-7">
            
            {/* Desktop Navigation Links */}
            <nav className="flex items-center space-x-1 xl:space-x-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center gap-1.5 ${
                      isHomePage
                        ? active
                          ? 'text-white bg-white/20 shadow-xs backdrop-blur-md'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                        : active
                        ? 'text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/70 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${link.badgeColor}`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className={`h-6 w-px ${isHomePage ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}></div>

            {/* User Auth & Actions on Far Right */}
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors border border-amber-300 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Admin
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  {/* Notification Bell & Dropdown Popover */}
                  <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setDropdownOpen(false);
                  }}
                  className={`relative p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                    isHomePage
                      ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200'
                  } ${notifOpen ? 'ring-2 ring-brand-500/50 bg-brand-500/10' : ''}`}
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white shadow-md shadow-emerald-500/40 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Menu */}
                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 text-slate-800 dark:text-slate-100">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                        {/* Filter Tabs */}
                        <div className="px-4 pt-2 pb-1.5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40">
                          <button
                            onClick={() => setNotifFilter('all')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              notifFilter === 'all'
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            All ({notifications.length})
                          </button>
                          <button
                            onClick={() => setNotifFilter('unread')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              notifFilter === 'unread'
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Unread ({unreadCount})
                          </button>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
                          {filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center space-y-2">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                                <Bell className="w-6 h-6 text-slate-400" />
                              </div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                {notifFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                              </p>
                              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                                When travelers follow you, like your trips, or join your journeys, you'll see them here!
                              </p>
                            </div>
                          ) : (
                            filteredNotifications.map((notif) => {
                              const isUnread = !notif.read;
                              return (
                                <div
                                  key={notif._id}
                                  onClick={() => {
                                    if (isUnread) markAsRead(notif._id);
                                    setNotifOpen(false);
                                    if (notif.link) navigate(notif.link);
                                  }}
                                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative ${
                                    isUnread
                                      ? 'bg-emerald-500/5 dark:bg-emerald-500/[0.07] hover:bg-emerald-500/10'
                                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                  }`}
                                >
                                  {/* Avatar / Icon with badge */}
                                  <div className="relative flex-shrink-0 mt-0.5">
                                    {notif.sender?.avatar ? (
                                      <img
                                        src={notif.sender.avatar}
                                        alt={notif.sender.name || 'User'}
                                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                                      />
                                    ) : (
                                      <div className="w-9 h-9 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-brand-400" />
                                      </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs">
                                      {getNotifIcon(notif.type)}
                                    </div>
                                  </div>

                                  {/* Text info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <h4 className={`text-xs font-black truncate ${
                                        isUnread ? 'text-white' : 'text-slate-300'
                                      }`}>
                                        {notif.title}
                                      </h4>
                                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                        {formatTimeAgo(notif.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                                      {notif.message}
                                    </p>
                                  </div>

                                  {/* Action / Dismiss */}
                                  <div className="flex flex-col items-center gap-1.5 self-center">
                                    {isUnread && (
                                      <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Unread"></span>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notif._id);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 rounded transition-all cursor-pointer"
                                      title="Remove notification"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between text-xs">
                            <button
                              onClick={clearAll}
                              className="text-slate-400 hover:text-rose-400 font-semibold transition-colors cursor-pointer"
                            >
                              Clear all
                            </button>
                            <Link
                              to="/socials"
                              onClick={() => setNotifOpen(false)}
                              className="text-brand-600 dark:text-brand-400 hover:underline font-bold"
                            >
                              Go to Socials ➔
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Profile Dropdown Button */}
                  <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-full border transition-all text-left ${
                      isHomePage
                        ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={user?.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/30"
                    />
                    <div className="hidden sm:block">
                      <p className={`text-xs font-bold leading-tight ${isHomePage ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                        {user?.name}
                      </p>
                      <p className={`text-[10px] font-semibold capitalize ${isHomePage ? 'text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {user?.role}
                      </p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 ${isHomePage ? 'text-white/60' : 'text-slate-400'}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800 dark:text-slate-100">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-700 dark:hover:text-brand-400"
                      >
                        <UserIcon className="w-4 h-4 text-brand-500" />
                        My Profile & Trips
                      </Link>

                      <Link
                        to="/planner"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-700 dark:hover:text-brand-400"
                      >
                        <PlusCircle className="w-4 h-4 text-brand-500" />
                        Plan a New Journey
                      </Link>

                      <Link
                        to="/community"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-700 dark:hover:text-brand-400"
                      >
                        <Users className="w-4 h-4 text-brand-500" />
                        Travel Buddies
                      </Link>

                      <Link
                        to="/socials"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-700 dark:hover:text-brand-400"
                      >
                        <MessageSquare className="w-4 h-4 text-brand-500" />
                        Socials & Chat Hub
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Admin Dashboard
                        </Link>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className={`px-4 py-2 text-xs xl:text-sm font-bold rounded-xl transition-all ${
                      isHomePage
                        ? 'text-white hover:bg-white/10'
                        : 'text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2.5 text-xs xl:text-sm font-extrabold text-white bg-gradient-to-r from-brand-600 to-ocean-600 hover:from-brand-700 hover:to-ocean-700 rounded-xl shadow-md shadow-brand-500/20 hover:shadow-lg transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setMobileMenuOpen(false);
                  }}
                  className={`relative p-2 rounded-xl focus:outline-none cursor-pointer ${
                    isHomePage ? 'text-white hover:bg-white/10' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setNotifOpen(false);
              }}
              className={`p-2 rounded-xl focus:outline-none ${
                isHomePage ? 'text-white hover:bg-white/10' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 pt-2 pb-6 space-y-2 text-slate-800 dark:text-slate-100">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold ${
                isActive(link.path)
                  ? 'text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <span>{link.name}</span>
              {link.badge && (
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${link.badgeColor}`}>
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800"
            >
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Admin Dashboard
            </Link>
          )}

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setNotifOpen(true);
                  }}
                  className="w-full mb-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-5 h-5 text-brand-500" />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </button>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl font-bold bg-brand-600 text-white shadow-md shadow-brand-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
