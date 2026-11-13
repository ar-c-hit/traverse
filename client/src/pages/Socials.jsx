import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Hash, 
  Pin, 
  Trash2, 
  Smile, 
  ShieldCheck, 
  Sparkles,
  Info,
  Calendar,
  Award,
  Globe2,
  Lock,
  UserPlus,
  UserCheck,
  Search,
  ArrowRight,
  ArrowUpRight,
  Compass,
  MapPin,
  CheckCircle2,
  Camera,
  Coffee,
  Plus
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const COMMUNITY_CHANNELS = [
  {
    id: 'general',
    name: 'general-lounge',
    desc: 'All travelers welcome! Share live travel updates and wanderlust.',
    icon: Globe2,
    badge: 'Hub'
  },
  {
    id: 'same-time-buddies',
    name: 'same-time-buddies',
    desc: 'Coordinate with travelers heading to your destination right now or soon.',
    icon: Calendar,
    badge: 'Matching'
  },
  {
    id: 'travel-veterans',
    name: 'travel-veterans',
    desc: 'Direct Q&A with travelers who have completed journeys.',
    icon: Award,
    badge: 'Advice'
  },
  {
    id: 'itinerary-review',
    name: 'itinerary-review',
    desc: 'Get community feedback on routes, timing, and travel budgets.',
    icon: Hash,
    badge: 'Plans'
  },
  {
    id: 'backpackers',
    name: 'backpackers-hub',
    desc: 'Hostels, shared train passes, packing hacks, and budget travel.',
    icon: Compass,
    badge: 'Social'
  },
  {
    id: 'budget-hacks',
    name: 'budget-hacks',
    desc: 'Discounts, local transport passes, and secret cheap foodie spots.',
    icon: Hash,
    badge: 'Hacks'
  }
];

const EMOJIS = ['👋', '✈️', '🎒', '🏔️', '🍜', '☕', '🔥', '📍', '🙌', '⭐'];

const Socials = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dmParam = searchParams.get('dm');
  const topicParam = searchParams.get('topic');
  const channelParam = searchParams.get('channel');

  const { user, token, isAuthenticated, isAdmin } = useAuth();
  const { 
    currentChannel, 
    changeChannel, 
    messages, 
    sendMessage, 
    deleteMessage,
    typingUsers, 
    notifyTyping, 
    onlineCount,
    onlineUsers = [],
    loading,
    directMessageUpdate
  } = useChat();
  const { triggerNotification } = useNotification();

  // Helper to safely extract user ID from any user or partner object
  const getPartnerId = (p) => (p?.partnerId || p?._id || p?.id)?.toString();

  // Navigation mode in Socials sidebar: 'channels' | 'direct' | 'people'
  const [socialMode, setSocialMode] = useState(dmParam ? 'direct' : 'channels');

  // Selected community channel: null by default on opening Socials so no chat auto-opens
  const [selectedChannel, setSelectedChannel] = useState(
    channelParam || (topicParam ? 'general' : null)
  );

  // Direct messaging state
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [dmSearch, setDmSearch] = useState('');

  // People Directory state
  const [directory, setDirectory] = useState([]);
  const [directorySearch, setDirectorySearch] = useState('');
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  // Mutual Friends state
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendsSearch, setFriendsSearch] = useState('');

  const [inputVal, setInputVal] = useState(
    topicParam ? `Hey everyone, anyone heading to ${topicParam}? ` : ''
  );
  const chatFeedRef = useRef(null);

  // Whether any chat (channel or direct partner) is open
  const hasActiveChat = Boolean(activePartner || selectedChannel);

  // Select a 1-on-1 DM partner
  const selectPartner = (partner) => {
    if (!partner) return;
    const pId = getPartnerId(partner);
    if (!pId) return;

    const normalized = {
      ...partner,
      partnerId: pId,
      _id: pId
    };

    setSelectedChannel(null);
    setActivePartner(normalized);
    setSocialMode('direct');

    // Ensure partner is represented in conversations list
    setConversations((prev) => {
      if (prev.some(c => getPartnerId(c) === pId)) return prev;
      return [normalized, ...prev];
    });

    if (user && user._id) {
      const u1 = user._id.toString();
      const u2 = pId;
      const dmChannelName = `dm_${[u1, u2].sort().join('_')}`;
      changeChannel(dmChannelName);
      setSearchParams({ dm: pId });
    }
  };

  // Select a Community Channel
  const selectChannel = (chanId) => {
    setActivePartner(null);
    setSelectedChannel(chanId);
    setSocialMode('channels');
    changeChannel(chanId);
    setSearchParams({ channel: chanId });
  };

  // Close active chat and return to overview
  const closeChat = () => {
    setActivePartner(null);
    setSelectedChannel(null);
    setSearchParams({});
  };

  // Fetch direct conversations
  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  // Fetch travelers directory (People)
  const fetchDirectory = async () => {
    setLoadingDirectory(true);
    try {
      const res = await fetch('/api/auth/directory', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setDirectory(data);
      }
    } catch (err) {
      console.error('Error fetching directory:', err);
    } finally {
      setLoadingDirectory(false);
    }
  };

  // Fetch mutual friends list
  const fetchFriends = async () => {
    if (!token) {
      setFriends([]);
      return;
    }
    setLoadingFriends(true);
    try {
      const res = await fetch('/api/auth/friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      fetchFriends();
    }
    fetchDirectory();
  }, [token, isAuthenticated]);

  // Synchronize activePartner channel when user profile finishes loading
  useEffect(() => {
    if (user && user._id && activePartner) {
      const pId = getPartnerId(activePartner);
      if (pId && pId !== user._id.toString()) {
        const u1 = user._id.toString();
        const u2 = pId;
        const dmChannelName = `dm_${[u1, u2].sort().join('_')}`;
        if (currentChannel !== dmChannelName) {
          changeChannel(dmChannelName);
          setSearchParams({ dm: pId });
        }
      }
    }
  }, [user, activePartner]);

  // Respond to incoming direct messages by updating conversation list in real-time
  useEffect(() => {
    if (!directMessageUpdate) return;
    const senderId = directMessageUpdate.senderId?.toString();
    const recipientId = directMessageUpdate.recipientId?.toString();
    const currentUserId = user?._id?.toString();

    const otherId = senderId === currentUserId ? recipientId : senderId;
    if (!otherId) return;

    setConversations((prev) => {
      const existingIndex = prev.findIndex(c => getPartnerId(c) === otherId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: directMessageUpdate.message,
          lastMessageAt: directMessageUpdate.createdAt || new Date()
        };
        return updated.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      } else {
        fetchConversations();
        return prev;
      }
    });
  }, [directMessageUpdate, user]);

  // Handle URL dmParam (?dm=userId)
  useEffect(() => {
    if (!dmParam) return;
    const activeId = getPartnerId(activePartner);
    if (activeId === dmParam) return;

    const match = conversations.find(c => getPartnerId(c) === dmParam);
    if (match) {
      selectPartner(match);
      return;
    }

    // Partner not in conversations list yet; fetch their profile
    fetch(`/api/auth/user/${dmParam}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : null)
      .then(uData => {
        if (uData) {
          selectPartner({
            partnerId: uData._id,
            _id: uData._id,
            name: uData.name,
            username: uData.username || uData.email?.split('@')[0],
            avatar: uData.avatar,
            role: uData.role,
            badge: uData.badge || (uData.role === 'admin' ? 'PRO' : 'EXPLORER'),
            homeCity: uData.homeCity || 'Worldwide',
            travelStyle: uData.travelStyle || 'Wanderer'
          });
        }
      })
      .catch(err => console.error('Error fetching direct message partner profile:', err));
  }, [dmParam, conversations, token]);

  // Toggle follow user from People directory
  const handleToggleFollow = async (targetUser) => {
    if (!isAuthenticated || !token) {
      alert('Please sign in to follow travelers and connect!');
      return;
    }

    try {
      const res = await fetch(`/api/auth/follow/${targetUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Update local directory
        setDirectory(prev => prev.map(u => {
          if (u._id === targetUser._id) {
            return {
              ...u,
              isFollowing: data.isFollowing,
              isFriend: data.isFriend,
              followsYou: data.followsYou,
              followersCount: data.followersCount
            };
          }
          return u;
        }));
        // Refresh mutual friends list and conversations
        fetchFriends();
        fetchConversations();

        // Dispatch instant local notification and toast alert
        if (data.isFollowing) {
          triggerNotification({
            type: 'follow',
            title: data.isFriend ? 'New Mutual Friend! 🤝' : 'Traveler Followed! 👤',
            message: data.isFriend 
              ? `You and ${targetUser.name} are now mutual friends! You can now chat 1-on-1.` 
              : `You started following ${targetUser.name}. We'll notify you when they follow back!`,
            link: `/socials?user=${targetUser._id}`,
            sender: {
              _id: targetUser._id,
              name: targetUser.name,
              avatar: targetUser.avatar,
              badge: targetUser.badge || 'EXPLORER'
            }
          });
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  // Start chat with user from directory or friends list
  const handleStartChatWithUser = (targetUser) => {
    if (!isAuthenticated) {
      alert('Please sign in to start a private chat!');
      return;
    }
    const targetId = getPartnerId(targetUser);
    const isFriend = targetUser.isFriend || friends.some(f => getPartnerId(f) === targetId);
    if (!isFriend && targetUser.role !== 'admin' && user?.role !== 'admin') {
      alert(`You and ${targetUser.name} must follow each other to become friends before chatting!`);
      return;
    }
    selectPartner({
      partnerId: targetId,
      name: targetUser.name,
      username: targetUser.username,
      avatar: targetUser.avatar,
      role: targetUser.role,
      badge: targetUser.badge,
      homeCity: targetUser.homeCity,
      travelStyle: targetUser.travelStyle
    });
  };

  const scrollToBottom = (behavior = 'smooth') => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTo({
        top: chatFeedRef.current.scrollHeight,
        behavior
      });
    }
  };

  useEffect(() => {
    scrollToBottom('instant');
  }, [currentChannel]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || !isAuthenticated) return;

    const text = inputVal.trim();
    setInputVal('');

    if (activePartner) {
      const pId = getPartnerId(activePartner);
      await sendMessage(text, null, pId);

      // Immediately update local conversation entry in the sidebar
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (getPartnerId(c) === pId) {
            return { ...c, lastMessage: text, lastMessageAt: new Date() };
          }
          return c;
        });
        return updated.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
    } else {
      await sendMessage(text);
    }
    notifyTyping(false);
  };

  const addEmoji = (emoji) => {
    setInputVal((prev) => prev + emoji);
  };

  // Filter direct conversations
  const filteredConversations = conversations.filter(c => {
    if (!dmSearch) return true;
    const q = dmSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      (c.homeCity && c.homeCity.toLowerCase().includes(q))
    );
  });

  // Filter directory
  const filteredDirectory = directory.filter(u => {
    if (user && u._id === user._id) return false; // don't show self in directory
    if (!directorySearch) return true;
    const q = directorySearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.homeCity && u.homeCity.toLowerCase().includes(q)) ||
      (u.travelStyle && u.travelStyle.toLowerCase().includes(q))
    );
  });

  // Check if a user ID is currently online
  const isUserOnline = (userId) => {
    if (!userId) return false;
    const uidStr = userId.toString();
    return Array.isArray(onlineUsers) && onlineUsers.some(id => id && id.toString() === uidStr);
  };

  // Filter mutual friends
  const filteredFriends = friends.filter(f => {
    if (!friendsSearch) return true;
    const q = friendsSearch.toLowerCase();
    return (
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.username && f.username.toLowerCase().includes(q)) ||
      (f.homeCity && f.homeCity.toLowerCase().includes(q)) ||
      (f.travelStyle && f.travelStyle.toLowerCase().includes(q))
    );
  });

  const onlineFriendsCount = friends.filter(f => isUserOnline(f._id)).length;

  // Travelers who follow the current user but user hasn't followed back yet
  const pendingFollowers = directory.filter(u => {
    if (user && u._id === user._id) return false;
    return u.followsYou && !u.isFollowing;
  });

  const activePartnerId = getPartnerId(activePartner);
  const isPartnerFriend = Boolean(
    activePartnerId &&
    (friends.some(f => getPartnerId(f) === activePartnerId) || 
     user?.role === 'admin' || 
     activePartner?.role === 'admin')
  );

  const activeChannelObj = COMMUNITY_CHANNELS.find(c => c.id === (selectedChannel || currentChannel)) || {
    id: selectedChannel || currentChannel || 'general',
    name: selectedChannel || currentChannel || 'general-lounge',
    desc: 'Live group conversation'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-5rem)] min-h-[640px] flex flex-col">
      
      {/* Top Banner / Socials Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 gap-3 flex-shrink-0 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-ocean-500 text-white flex items-center justify-center text-sm shadow-md shadow-brand-500/25">
                💬
              </span>
              Traverse Socials
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-800/80">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Connections
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Connect in community channels, chat 1-on-1 with mutual friends, and explore travelers worldwide.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
          <button
            onClick={() => {
              setSocialMode('channels');
              setActivePartner(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              socialMode === 'channels'
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Communities</span>
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                alert('Please sign in to view your direct messages!');
                return;
              }
              setSocialMode('direct');
              setSelectedChannel(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              socialMode === 'direct'
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Chat</span>
            {conversations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300 text-[10px]">
                {conversations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setSocialMode('people');
              setSelectedChannel(null);
              setActivePartner(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              socialMode === 'people'
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>People</span>
            {friends.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                {friends.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Body: Sidebar + Chat Feed or Friends View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 flex-1 overflow-hidden">
        
        {/* ============================================================== */}
        {/* LEFT SIDEBAR: CHANNELS / DIRECT CHATS / PEOPLE DIRECTORY        */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 flex flex-col h-full overflow-hidden transition-colors">
          
          {socialMode === 'channels' ? (
            /* SUB-PANEL 1: COMMUNITY CHANNELS */
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Community Channels ({COMMUNITY_CHANNELS.length})
                </span>
                <span className="text-[10px] font-bold text-slate-400">Public Rooms</span>
              </div>

              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                {COMMUNITY_CHANNELS.map((chan) => {
                  const Icon = chan.icon;
                  const isActive = selectedChannel === chan.id && !activePartner;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => selectChannel(chan.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 border cursor-pointer ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800 text-brand-900 dark:text-brand-300 shadow-sm'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-xl flex-shrink-0 ${
                        isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black truncate">#{chan.name}</p>
                          {chan.badge && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {chan.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">
                          {chan.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-gradient-to-r from-brand-50 to-ocean-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-brand-100 dark:border-slate-700 text-center">
                <p className="text-xs font-bold text-brand-900 dark:text-brand-300">Looking for travel partners?</p>
                <button
                  onClick={() => setSocialMode('people')}
                  className="mt-1.5 text-xs font-extrabold text-brand-700 dark:text-brand-400 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Discover People & Friends ➔</span>
                </button>
              </div>
            </div>
          ) : socialMode === 'direct' ? (
            /* SUB-PANEL 2: 1-ON-1 DIRECT MESSAGES */
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Direct Chats ({conversations.length})
                </span>
                <button
                  onClick={() => setSocialMode('people')}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> New Chat
                </button>
              </div>

              {/* DM Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter direct conversations..."
                  value={dmSearch}
                  onChange={(e) => setDmSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Conversations List */}
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs space-y-2">
                    <p>No conversations found.</p>
                    <button
                      onClick={() => setSocialMode('people')}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                    >
                      Find Friends to Message
                    </button>
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const isSelected = activePartner && getPartnerId(activePartner) === getPartnerId(c);
                    const pKey = getPartnerId(c);
                    return (
                      <button
                        key={pKey}
                        onClick={() => selectPartner(c)}
                        className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-center gap-3 border ${
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800 shadow-sm'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={c.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
                          />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800 absolute bottom-0 right-0"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">{c.name}</p>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-white">
                              {c.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                            {c.lastMessage}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* SUB-PANEL 3: PEOPLE DIRECTORY IN SIDEBAR */
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    People Directory
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    {filteredDirectory.length}
                  </span>
                </div>
                <button
                  onClick={() => setSocialMode('channels')}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search people by name, city, style..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {filteredDirectory.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No travelers found matching "{directorySearch}".
                  </div>
                ) : (
                  filteredDirectory.map((u) => {
                    const isOnline = isUserOnline(u._id);
                    return (
                      <div
                        key={u._id}
                        className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl space-y-2 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/profile/${u._id}`}
                            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className={`w-9 h-9 rounded-full object-cover ring-2 ${
                                  isOnline
                                    ? 'ring-emerald-400'
                                    : 'ring-slate-100 dark:ring-slate-700'
                                }`}
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 ${
                                  isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                                title={isOnline ? 'Online Now' : 'Offline'}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate">
                                {u.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold truncate">
                                @{u.username} • {u.homeCity}
                              </p>
                            </div>
                          </Link>

                          <div className="flex items-center gap-1">
                            {u.isFriend ? (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/60">
                                🤝 Friends
                              </span>
                            ) : u.followsYou ? (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300">
                                Follows You
                              </span>
                            ) : (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-white">
                                {u.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                          <button
                            onClick={() => handleToggleFollow(u)}
                            className={`flex-1 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              u.isFriend
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400'
                                : u.isFollowing
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400'
                                : u.followsYou
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm'
                                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                            }`}
                          >
                            {u.isFriend ? (
                              <>
                                <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Friends</span>
                              </>
                            ) : u.isFollowing ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Following</span>
                              </>
                            ) : u.followsYou ? (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>Follow Back</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>

                          {u.isFriend ? (
                            <button
                              onClick={() => handleStartChatWithUser(u)}
                              className="p-1.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                              title="Chat with friend"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Chat</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => alert(`You and ${u.name} must follow each other to become friends before chatting!`)}
                              className="p-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-bold flex items-center gap-1 opacity-70 hover:opacity-100 cursor-not-allowed select-none"
                              title="Must follow each other to chat"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Locked</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

        {/* ============================================================== */}
        {/* RIGHT PANEL: FRIENDS VIEW (in People mode) OR CHAT FEED       */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col h-full overflow-hidden transition-colors">
          
          {socialMode === 'people' ? (
            /* ============================================================== */
            /* PEOPLE MODE: REPLACES CHAT SECTION WITH FRIENDS & ONLINE STATE */
            /* ============================================================== */
            <div className="flex flex-col h-full overflow-hidden">
              {/* Friends Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-xs">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                        <span>My Friends</span>
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        {friends.length} Mutual
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Travelers who follow you back. You can see their live online status and chat 1-on-1.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{onlineFriendsCount} Online Now</span>
                  </span>
                </div>
              </div>

              {/* Quick Friends Search Filter (if friends exist) */}
              {friends.length > 0 && (
                <div className="p-3 sm:px-5 border-b border-slate-800 bg-slate-900/60">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search your friends by name, city, style..."
                      value={friendsSearch}
                      onChange={(e) => setFriendsSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Friends Content: Grid or Empty State */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {filteredFriends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFriends.map((f) => {
                      const isOnline = isUserOnline(f._id);
                      return (
                        <div
                          key={f._id}
                          className="p-4 bg-slate-50/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-brand-400 dark:hover:border-brand-600 transition-all flex flex-col justify-between gap-3 group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              to={`/profile/${f._id}`}
                              className="flex items-center gap-3 min-w-0 group/profile"
                            >
                              <div className="relative flex-shrink-0">
                                <img
                                  src={f.avatar}
                                  alt={f.name}
                                  className={`w-12 h-12 rounded-full object-cover ring-2 ${
                                    isOnline
                                      ? 'ring-emerald-400 dark:ring-emerald-500 shadow-sm'
                                      : 'ring-slate-200 dark:ring-slate-700'
                                  }`}
                                />
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                                    isOnline ? 'bg-emerald-500 ring-2 ring-emerald-400/40' : 'bg-slate-400'
                                  }`}
                                  title={isOnline ? 'Online Now' : 'Offline'}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover/profile:text-brand-600 dark:hover/profile:text-brand-400 transition-colors truncate">
                                    {f.name}
                                  </h4>
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-white flex-shrink-0">
                                    {f.badge || 'EXPLORER'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                                  @{f.username} • {f.homeCity}
                                </p>
                              </div>
                            </Link>

                            {/* Live Online Badge */}
                            {isOnline ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1 border border-emerald-300/60 dark:border-emerald-700/60 shadow-xs flex-shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>Online</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-bold border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                Offline
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
                            <span>🎒 {f.travelStyle || 'Wanderer'}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">🤝 Friends</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/80">
                            <button
                              onClick={() => handleStartChatWithUser(f)}
                              className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-brand-500/20 transition-all cursor-pointer active:scale-95"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message Friend</span>
                            </button>
                            <Link
                              to={`/profile/${f._id}`}
                              className="p-2 px-3 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                              title="View Full Profile"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty state when no mutual friends found */
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto my-auto">
                    <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800 shadow-sm">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {friendsSearch ? 'No Friends Matching Search' : 'No Mutual Friends Yet'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {friendsSearch
                          ? `No friends matched "${friendsSearch}". Try clearing your search.`
                          : 'To become friends on Traverse, you and another traveler must follow each other! Once you are mutual friends, you can see their live online status and chat 1-on-1.'}
                      </p>
                    </div>

                    {/* Pending followers who follow the current user */}
                    {!friendsSearch && pendingFollowers.length > 0 && (
                      <div className="w-full text-left bg-gradient-to-br from-emerald-50/70 to-teal-50/70 dark:from-slate-800/80 dark:to-slate-900/80 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 space-y-2.5 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                            Travelers Following You ({pendingFollowers.length})
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            Follow back to become friends!
                          </span>
                        </div>
                        <div className="space-y-2">
                          {pendingFollowers.slice(0, 3).map((u) => (
                            <div
                              key={u._id}
                              className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-slate-800 shadow-2xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-300"
                                />
                                <div className="truncate">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {u.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    @{u.username} • {u.homeCity}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleToggleFollow(u)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>Follow Back</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : !hasActiveChat ? (
            /* ============================================================== */
            /* EMPTY / PLACEHOLDER VIEW: NO CHAT OPEN UNTIL USER CLICKS ONE   */
            /* ============================================================== */
            <div className="h-full flex flex-col items-center justify-center text-center p-8 sm:p-12 space-y-6 my-auto max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/5">
                <MessageSquare className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  {socialMode === 'direct' ? 'Select a Direct Conversation' : 'Select a Community Channel'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
                  {socialMode === 'direct'
                    ? 'Choose a friend from your direct conversations on the left to start chatting 1-on-1, or find new friends in the People directory.'
                    : 'Click any community channel on the left to open live discussions, view coordinate tips, and connect with active travelers.'}
                </p>
              </div>

              {socialMode === 'channels' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
                  {COMMUNITY_CHANNELS.slice(0, 4).map((chan) => {
                    const Icon = chan.icon;
                    return (
                      <button
                        key={chan.id}
                        type="button"
                        onClick={() => selectChannel(chan.id)}
                        className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-emerald-500/50 text-left transition-all cursor-pointer group shadow-sm hover:scale-[1.01]"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                              #{chan.name}
                            </span>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                            {chan.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {chan.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSocialMode('people')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Explore People Directory</span>
                </button>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* CHAT MODE: CHANNELS & DIRECT MESSAGING FEED                    */
            /* ============================================================== */
            <>
              {/* Chat Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between flex-shrink-0">
                {activePartner ? (
                  /* 1-on-1 Direct Message Header */
                  <div className="flex items-center justify-between w-full">
                    <Link
                      to={`/profile/${getPartnerId(activePartner)}`}
                      className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
                      title="View full profile"
                    >
                      <div className="relative">
                        <img
                          src={activePartner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={activePartner.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-sm"
                        />
                        <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 absolute bottom-0 right-0 ${
                          isUserOnline(getPartnerId(activePartner)) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-500'
                        }`}></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                            {activePartner.name}
                          </h3>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {activePartner.badge || 'EXPLORER'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                          <span className="text-slate-400">@{activePartner.username || 'wanderer'}</span>
                          <span className="text-slate-600">•</span>
                          <span className={isUserOnline(getPartnerId(activePartner)) ? "text-emerald-400 font-bold" : "text-slate-400"}>
                            {isUserOnline(getPartnerId(activePartner)) ? "🟢 Online" : "⚪ Offline"}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className={isPartnerFriend ? "text-emerald-400 font-bold" : "text-amber-400/90 font-bold"}>
                            {isPartnerFriend ? "🤝 Mutual Friends" : "🔒 Not Mutual Friends"}
                          </span>
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${getPartnerId(activePartner)}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <span>View Profile & Map</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      </Link>
                      <button
                        type="button"
                        onClick={closeChat}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Close chat"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Community Channel Header */
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shadow-xs">
                        <Hash className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1">
                          #{activeChannelObj.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium line-clamp-1">
                          {activeChannelObj.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{onlineCount} Travelers Active</span>
                      </div>
                      <button
                        type="button"
                        onClick={closeChat}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Close chat"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Scroll Feed */}
              <div
                ref={chatFeedRef}
                className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/40"
              >
                {/* Greeting Card for DMs */}
                {activePartner && messages.length === 0 && (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 max-w-md mx-auto my-6 shadow-sm">
                    <img
                      src={activePartner.avatar}
                      alt={activePartner.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto ring-4 ring-brand-100 dark:ring-brand-950/80 shadow-md"
                    />
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Start your conversation with {activePartner.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Discuss route ideas, compare travel dates, share hotel recommendations, or coordinate meetups!
                    </p>
                    <div className="flex justify-center gap-2 pt-1">
                      <button
                        onClick={() => setInputVal(`Hi ${activePartner.name.split(' ')[0]}! Love your travel route, let's sync up!`)}
                        className="px-3 py-1.5 bg-brand-50 dark:bg-brand-950/70 text-brand-800 dark:text-brand-300 rounded-xl text-xs font-bold hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors cursor-pointer"
                      >
                        👋 Say Hello
                      </button>
                      <button
                        onClick={() => setInputVal(`Hey! Are you open to sharing rentals or splitting cabs on your trip?`)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        🚗 Travel Together
                      </button>
                    </div>
                  </div>
                )}

                {/* Messages List */}
                {messages.map((m) => {
                  const isMine = user && m.senderId?.toString() === user._id?.toString();
                  return (
                    <div
                      key={m._id}
                      className={`flex items-start gap-3 group ${
                        isMine ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Clickable Profile Avatar */}
                      <Link
                        to={`/profile/${m.senderId}`}
                        title={`View ${m.senderName}'s Profile`}
                        className="flex-shrink-0 hover:scale-105 transition-transform"
                      >
                        <img
                          src={m.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={m.senderName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 shadow-sm"
                        />
                      </Link>

                      {/* Message Bubble Content */}
                      <div className={`max-w-[80%] sm:max-w-md ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center gap-2 mb-1 text-[11px] ${
                          isMine ? 'justify-end' : 'justify-start'
                        }`}>
                          <Link
                            to={`/profile/${m.senderId}`}
                            className="font-black text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                          >
                            {m.senderName}
                          </Link>
                          {m.senderRole === 'admin' && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white font-black text-[9px] uppercase">
                              Admin
                            </span>
                          )}
                          <span className="text-slate-400">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                            isMine
                              ? 'bg-brand-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                          }`}
                        >
                          {m.message}
                        </div>

                        {/* Delete Option for sender or admin */}
                        {(isMine || isAdmin) && (
                          <button
                            onClick={() => deleteMessage(m._id)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-rose-600 pt-0.5 transition-opacity cursor-pointer"
                            title="Delete message"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="px-6 py-1.5 text-[11px] text-slate-400 italic bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                  {typingUsers.map(u => u.name).join(', ')} typing...
                </div>
              )}

              {/* Bottom Chat Input Bar */}
              <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-2 flex-shrink-0 transition-colors">
                {/* Quick Emoji Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">React:</span>
                  {EMOJIS.map((e, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addEmoji(e)}
                      className="hover:scale-125 transition-transform p-0.5 cursor-pointer"
                    >
                      {e}
                    </button>
                  ))}
                </div>

                {/* Input form or Mutual Friend Lock Banner */}
                {isAuthenticated ? (
                  socialMode === 'direct' && !activePartner ? (
                    <div className="p-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                      Select a conversation from the left or switch to "People" to find friends.
                    </div>
                  ) : activePartner && !isPartnerFriend ? (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <span>
                          Direct chat is locked. You and <strong>{activePartner.name}</strong> must follow each other to become friends and chat!
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const found = directory.find((u) => u._id === getPartnerId(activePartner));
                          if (found) handleToggleFollow(found);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow {activePartner.name}</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={
                          activePartner
                            ? `Message ${activePartner.name} directly...`
                            : `Message #${activeChannelObj.name}...`
                        }
                        value={inputVal}
                        onChange={(e) => {
                          setInputVal(e.target.value);
                          notifyTyping(Boolean(e.target.value));
                        }}
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <button
                        type="submit"
                        disabled={!inputVal.trim()}
                        className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Send</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )
                ) : (
                  <div className="p-3 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-2xl flex items-center justify-between text-xs text-brand-900 dark:text-brand-300 font-semibold">
                    <span>Sign in to participate in live community discussions and send direct messages.</span>
                    <Link
                      to="/login"
                      className="px-4 py-1.5 bg-brand-600 text-white rounded-xl font-bold shadow-sm"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
};

export default Socials;

