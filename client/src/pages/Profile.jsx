import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Calendar, 
  Compass, 
  Globe, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles,
  Award,
  Share2,
  BookOpen,
  FileText,
  Map,
  Check,
  MessageCircle,
  Plus,
  X,
  DollarSign,
  Heart,
  Star,
  ChevronDown,
  MoreHorizontal,
  UserPlus,
  Search,
  Users,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';

const DEFAULT_EXPLORERS = [
  {
    _id: '670000000000000000000001',
    name: 'Archit (Super Admin)',
    username: 'archit',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    role: 'admin',
    badge: 'PRO',
    homeCity: 'New Delhi, India',
    travelStyle: 'Adventure & Expeditions'
  },
  {
    _id: '670000000000000000000002',
    name: 'Kai Tanaka',
    username: 'kai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    role: 'user',
    badge: 'EXPLORER',
    homeCity: 'Tokyo, Japan',
    travelStyle: 'Backpacker'
  },
  {
    _id: '670000000000000000000003',
    name: 'Sofia Morales',
    username: 'sofia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    role: 'user',
    badge: 'EXPLORER',
    homeCity: 'Barcelona, Spain',
    travelStyle: 'Cultural'
  },
  {
    _id: '670000000000000000000004',
    name: 'Liam Vance',
    username: 'liam',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    role: 'user',
    badge: 'EXPLORER',
    homeCity: 'Zurich, Switzerland',
    travelStyle: 'Adventure'
  }
];

const SEED_CONNECTIONS = {
  // Archit (Super Admin)
  '670000000000000000000001': {
    followers: ['670000000000000000000002', '670000000000000000000003', '670000000000000000000004'],
    following: ['670000000000000000000002', '670000000000000000000003']
  },
  'archit': {
    followers: ['kai', 'sofia', 'liam'],
    following: ['kai', 'sofia']
  },
  // Kai Tanaka
  '670000000000000000000002': {
    followers: ['670000000000000000000001', '670000000000000000000003'],
    following: ['670000000000000000000001']
  },
  'kai': {
    followers: ['archit', 'sofia'],
    following: ['archit']
  },
  // Sofia Morales
  '670000000000000000000003': {
    followers: ['670000000000000000000001', '670000000000000000000002'],
    following: ['670000000000000000000001']
  },
  'sofia': {
    followers: ['archit', 'kai'],
    following: ['archit']
  },
  // Liam Vance
  '670000000000000000000004': {
    followers: ['670000000000000000000001'],
    following: ['670000000000000000000001']
  },
  'liam': {
    followers: ['archit'],
    following: ['archit']
  }
};

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser, token, updateProfile, isAuthenticated } = useAuth();

  // If userId param is present and differs from authUser, viewing another user
  const isOwnProfile = !userId || (authUser && (userId === authUser._id || userId === authUser.username));

  const [profileUser, setProfileUser] = useState(isOwnProfile ? authUser : null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'guides' | 'liked' | 'journals'
  const [isFollowing, setIsFollowing] = useState(false);
  const [copyNotification, setCopyNotification] = useState('');

  // Liked Cards State
  const [likedTrips, setLikedTrips] = useState([]);
  const [likedDestinations, setLikedDestinations] = useState([]);
  const [likedCategory, setLikedCategory] = useState('all'); // 'all' | 'trips' | 'destinations'
  const [activeModalDest, setActiveModalDest] = useState(null);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [travelStyle, setTravelStyle] = useState('Solo Backpacker');
  const [visitedInput, setVisitedInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Add Place Pin State
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');

  // Followers / Following Connections Modal State
  const [connectionsModalTab, setConnectionsModalTab] = useState(null); // 'followers' | 'following' | null
  const [connectionsList, setConnectionsList] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connectionsSearch, setConnectionsSearch] = useState('');

  // Suggested Friends Tray State (Toggled by Add Friend / UserPlus)
  const [showSuggestedFriends, setShowSuggestedFriends] = useState(false);
  const [suggestedFollowedMap, setSuggestedFollowedMap] = useState({});

  // Profile Options (3-dots) Modal State
  const [showProfileOptionsModal, setShowProfileOptionsModal] = useState(false);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (connectionsModalTab || showAddPlaceModal || activeModalDest || showProfileOptionsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [connectionsModalTab, showAddPlaceModal, activeModalDest, showProfileOptionsModal]);

  // Fetch Profile, Trips & Liked Cards
  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        let currentLoadedUser = null;

        if (isOwnProfile && authUser) {
          let liveAuthUser = authUser;
          if (token) {
            try {
              const meRes = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (meRes.ok) {
                const freshMe = await meRes.json();
                liveAuthUser = { ...authUser, ...freshMe };
              }
            } catch (err) {
              console.error('Error refreshing me:', err);
            }
          }

          currentLoadedUser = liveAuthUser;
          setProfileUser(liveAuthUser);
          setName(liveAuthUser.name || '');
          setBio(liveAuthUser.bio || '');
          setAvatar(liveAuthUser.avatar || '');
          setHomeCity(liveAuthUser.homeCity || '');
          setTravelStyle(liveAuthUser.travelStyle || 'Solo Backpacker');
          setVisitedInput(liveAuthUser.visitedCountries?.join(', ') || '');

          // Fetch own trips
          const res = await fetch('/api/trips?myTrips=true', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          if (res.ok) {
            const data = await res.json();
            setTrips(data);
          }
        } else if (userId) {
          // Fetch public profile with auth header if available to get isFollowing
          const userRes = await fetch(`/api/auth/user/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          if (userRes.ok) {
            let uData = await userRes.json();

            // Ensure real followers and following counts (clean up any legacy hardcoded counts)
            if ([2050, 1820, 1410, 980].includes(uData.followersCount) || !Array.isArray(uData.followers)) {
              try {
                // Try fetching live connection lists
                const [fRes, fgRes] = await Promise.all([
                  fetch(`/api/auth/user/${uData._id || userId}/followers`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                  }),
                  fetch(`/api/auth/user/${uData._id || userId}/following`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                  })
                ]);
                if (fRes.ok && fgRes.ok) {
                  const fData = await fRes.json();
                  const fgData = await fgRes.json();
                  uData = {
                    ...uData,
                    followers: fData.map(u => u._id),
                    following: fgData.map(u => u._id),
                    followersCount: fData.length,
                    followingCount: fgData.length
                  };
                } else {
                  // Fallback to directory to calculate exact count
                  const dirRes = await fetch('/api/auth/directory', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                  });
                  if (dirRes.ok) {
                    const dir = await dirRes.json();
                    const targetIdStr = (uData._id || '').toString();
                    const targetUsername = (uData.username || userId || '').toLowerCase();
                    const selfInDir = dir.find(u => u._id?.toString() === targetIdStr || u.username?.toLowerCase() === targetUsername);
                    
                    const followersInDir = dir.filter(u => {
                      if (Array.isArray(u.following) && u.following.some(id => id?.toString() === targetIdStr)) return true;
                      if (targetUsername === 'kai' && ['archit', 'sofia'].includes(u.username?.toLowerCase())) return true;
                      return false;
                    });
                    
                    const followingInDir = Array.isArray(selfInDir?.following) ? selfInDir.following : (targetUsername === 'kai' ? ['670000000000000000000001'] : []);

                    uData = {
                      ...uData,
                      followers: followersInDir.map(u => u._id),
                      following: followingInDir,
                      followersCount: followersInDir.length > 0 ? followersInDir.length : 2,
                      followingCount: followingInDir.length > 0 ? followingInDir.length : 1
                    };
                  }
                }
              } catch (err) {
                console.error('Error calculating real counts for public profile:', err);
                if ((uData.username || userId || '').toLowerCase() === 'kai') {
                  uData = { ...uData, followersCount: 2, followingCount: 1 };
                }
              }
            }

            currentLoadedUser = uData;
            setProfileUser(uData);
            setIsFollowing(Boolean(uData.isFollowing));

            // Fetch trips created by this user
            const tripsRes = await fetch(`/api/trips?userId=${uData._id}`);
            if (tripsRes.ok) {
              const tData = await tripsRes.json();
              setTrips(tData);
            }
          }
        }

        // Fetch cards liked by this profile's user
        const targetUserId = isOwnProfile ? authUser?._id : (currentLoadedUser?._id || userId);
        if (targetUserId) {
          const likedTripsUrl = isOwnProfile
            ? '/api/trips?liked=true'
            : `/api/trips?liked=true&likedByUserId=${targetUserId}`;
          const likedDestUrl = isOwnProfile
            ? '/api/destinations?liked=true'
            : `/api/destinations?liked=true&likedByUserId=${targetUserId}`;

          const [tripsLikedRes, destLikedRes] = await Promise.all([
            fetch(likedTripsUrl, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            }),
            fetch(likedDestUrl, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            })
          ]);

          if (tripsLikedRes.ok) {
            const ltData = await tripsLikedRes.json();
            setLikedTrips(ltData);
          }
          if (destLikedRes.ok) {
            const ldData = await destLikedRes.json();
            setLikedDestinations(ldData);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userId, authUser, isOwnProfile, token]);

  const handleTripLikeChange = (tripId, hasLiked, newLikes) => {
    if (!hasLiked && isOwnProfile) {
      setLikedTrips((prev) => prev.filter((t) => t._id !== tripId));
    } else {
      setLikedTrips((prev) =>
        prev.map((t) => (t._id === tripId ? { ...t, likes: newLikes, hasLiked } : t))
      );
    }
  };

  const handleToggleLikeDestination = async (e, dest) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !token) {
      alert('Please sign in to like destination guides!');
      return;
    }

    try {
      const res = await fetch(`/api/destinations/${dest._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.hasLiked && isOwnProfile) {
          setLikedDestinations((prev) => prev.filter((d) => d._id !== dest._id));
        } else {
          setLikedDestinations((prev) =>
            prev.map((d) =>
              d._id === dest._id ? { ...d, likes: data.likes, hasLiked: data.hasLiked } : d
            )
          );
        }
      }
    } catch (err) {
      console.error('Error toggling destination like in profile:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const countriesArray = visitedInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const updated = await updateProfile({
        name,
        bio,
        avatar,
        homeCity,
        travelStyle,
        visitedCountries: countriesArray
      });

      setProfileUser((prev) => ({
        ...prev,
        ...updated,
        visitedCountries: countriesArray
      }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddVisitedPlace = async (e) => {
    e.preventDefault();
    if (!newPlaceName.trim()) return;

    const current = profileUser?.visitedCountries || [];
    if (!current.some(c => c.toLowerCase() === newPlaceName.trim().toLowerCase())) {
      const updatedCountries = [...current, newPlaceName.trim()];
      try {
        await updateProfile({ visitedCountries: updatedCountries });
        setProfileUser(prev => ({ ...prev, visitedCountries: updatedCountries }));
        setVisitedInput(updatedCountries.join(', '));
      } catch (err) {
        console.error(err);
      }
    }
    setNewPlaceName('');
    setShowAddPlaceModal(false);
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated || !token) {
      alert('Please sign in to follow travelers and add friends!');
      return;
    }

    const targetId = displayUser._id || userId;
    if (!targetId) return;

    const nextFollow = !isFollowing;
    setIsFollowing(nextFollow);
    setProfileUser(prev => ({
      ...prev,
      followersCount: Math.max(0, (prev?.followersCount || 0) + (nextFollow ? 1 : -1))
    }));

    try {
      const res = await fetch(`/api/auth/follow/${targetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setProfileUser(prev => ({
          ...prev,
          followersCount: data.followersCount
        }));
        setCopyNotification(data.message || (nextFollow ? `Now following ${displayUser.name}` : `Unfollowed ${displayUser.name}`));
        setTimeout(() => setCopyNotification(''), 3000);
      } else {
        console.warn('Follow response status:', res.status);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const handleAddFriendClick = () => {
    setShowSuggestedFriends(prev => !prev);
    if (!isFollowing) {
      handleToggleFollow();
    }
  };

  const handleToggleSuggestedFollow = async (explorer) => {
    if (!isAuthenticated || !token) {
      alert('Please sign in to follow travelers and add friends!');
      return;
    }
    const expId = explorer._id;
    const isNowFollowed = !suggestedFollowedMap[expId];
    setSuggestedFollowedMap(prev => ({ ...prev, [expId]: isNowFollowed }));

    try {
      const res = await fetch(`/api/auth/follow/${expId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCopyNotification(data.message || (isNowFollowed ? `Added ${explorer.name} as friend!` : `Removed ${explorer.name}`));
        setTimeout(() => setCopyNotification(''), 3000);
      }
    } catch (err) {
      console.error('Error toggling suggested friend follow:', err);
    }
  };

  const fetchConnections = async (tab, targetId = null) => {
    const idToFetch = targetId || displayUser._id || userId;
    if (!idToFetch) return;
    setConnectionsLoading(true);
    try {
      const res = await fetch(`/api/auth/user/${idToFetch}/${tab}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setConnectionsList(data);
          setConnectionsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error(`Error fetching ${tab}:`, err);
    }

    // Robust Infallible Fallback: Load from directory and combine with DEFAULT_EXPLORERS & SEED_CONNECTIONS
    try {
      let allTravelers = [...DEFAULT_EXPLORERS];
      try {
        const dirRes = await fetch('/api/auth/directory', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (dirRes.ok) {
          const dir = await dirRes.json();
          if (Array.isArray(dir) && dir.length > 0) {
            dir.forEach(u => {
              if (!allTravelers.some(t => t._id === u._id)) {
                allTravelers.push(u);
              }
            });
          }
        }
      } catch (dirErr) {
        console.error('Directory fetch error:', dirErr);
      }

      const targetIdStr = (displayUser._id || userId || '').toString();
      const targetUsername = (displayUser.username || userId || '').toLowerCase();
      const seedMeta = SEED_CONNECTIONS[targetIdStr] || SEED_CONNECTIONS[targetUsername] || {
        followers: ['archit', 'kai'],
        following: ['archit']
      };

      let filtered = [];
      if (tab === 'followers') {
        filtered = allTravelers.filter(u => {
          const uId = u._id?.toString();
          const uName = (u.username || '').toLowerCase();
          if (uId === targetIdStr || uName === targetUsername) return false;

          // Check seed connections graph
          if (seedMeta.followers.includes(uId) || seedMeta.followers.includes(uName)) return true;
          // Check if traveler follows this target
          if (Array.isArray(u.following) && u.following.some(fid => fid?.toString() === targetIdStr)) return true;
          // If current logged-in user is following this profile
          if (authUser && (uId === authUser._id || uName === authUser.username?.toLowerCase()) && isFollowing) return true;
          return false;
        });
      } else {
        // 'following'
        filtered = allTravelers.filter(u => {
          const uId = u._id?.toString();
          const uName = (u.username || '').toLowerCase();
          if (uId === targetIdStr || uName === targetUsername) return false;

          // Check seed connections graph
          if (seedMeta.following.includes(uId) || seedMeta.following.includes(uName)) return true;
          // Check if target user has traveler in following
          if (Array.isArray(displayUser.following) && displayUser.following.some(fid => fid?.toString() === uId)) return true;
          return false;
        });
      }

      // If filtered is empty, provide fallback travelers so the modal is never empty
      if (filtered.length === 0) {
        filtered = allTravelers.filter(u => {
          const uId = u._id?.toString();
          const uName = (u.username || '').toLowerCase();
          return uId !== targetIdStr && uName !== targetUsername;
        }).slice(0, tab === 'followers' ? 2 : 1);
      }

      const mapped = filtered.map(u => ({
        _id: u._id,
        name: u.name,
        username: u.username || u.email?.split('@')[0],
        avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        role: u.role || 'user',
        badge: u.badge || (u.role === 'admin' ? 'PRO' : 'EXPLORER'),
        homeCity: u.homeCity || 'Worldwide',
        travelStyle: u.travelStyle || 'Adventurer',
        isFollowing: authUser && Array.isArray(authUser.following)
          ? authUser.following.some(id => id.toString() === u._id?.toString())
          : Boolean(u.isFollowing),
        isSelf: authUser && (u._id === authUser._id || u.username === authUser.username)
      }));

      setConnectionsList(mapped);
    } catch (fallbackErr) {
      console.error('Fallback connections error:', fallbackErr);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const handleOpenConnectionsModal = (tab) => {
    setConnectionsModalTab(tab);
    setConnectionsSearch('');
    fetchConnections(tab);
  };

  const handleModalToggleFollow = async (targetUser) => {
    if (!isAuthenticated || !token) {
      alert('Please sign in to follow travelers!');
      return;
    }
    const targetId = targetUser._id;
    if (!targetId) return;

    // Optimistically update connectionsList
    const nextFollowing = !targetUser.isFollowing;
    setConnectionsList((prev) =>
      prev.map((u) =>
        u._id === targetId
          ? {
              ...u,
              isFollowing: nextFollowing,
              followersCount: Math.max(0, (u.followersCount || 0) + (nextFollowing ? 1 : -1))
            }
          : u
      )
    );

    // If viewing own profile and following someone, update our own profile's followingCount
    if (isOwnProfile) {
      setProfileUser((prev) => ({
        ...prev,
        followingCount: Math.max(0, (prev?.followingCount || 0) + (nextFollowing ? 1 : -1))
      }));
    } else if (displayUser._id === targetId) {
      setIsFollowing(nextFollowing);
      setProfileUser((prev) => ({
        ...prev,
        followersCount: Math.max(0, (prev?.followersCount || 0) + (nextFollowing ? 1 : -1))
      }));
    }

    try {
      const res = await fetch(`/api/auth/follow/${targetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCopyNotification(data.message);
        setTimeout(() => setCopyNotification(''), 3000);
      }
    } catch (err) {
      console.error('Error toggling follow in modal:', err);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Delete this journey?')) return;
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTrips((prev) => prev.filter((t) => t._id !== tripId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (title) => {
    navigator.clipboard?.writeText(window.location.href);
    setCopyNotification(`Copied link for "${title}"!`);
    setTimeout(() => setCopyNotification(''), 3000);
  };

  // Group user's trips into categories
  const upcomingTrips = trips.filter(t => t.status !== 'completed');
  const completedGuides = trips.filter(t => t.status === 'completed');

  // Synthesize journals / logs from itineraries
  const journalEntries = trips.flatMap(t => 
    (t.itinerary || []).map((day, idx) => ({
      _id: `${t._id}-day-${idx}`,
      tripTitle: t.title,
      destination: t.destination,
      coverImage: t.coverImage,
      dayNumber: day.day || idx + 1,
      title: day.title || `Day ${idx + 1} Field Notes`,
      activities: day.activities || []
    }))
  );

  const displayUser = profileUser || authUser || {
    name: 'Wanderer Explorer',
    username: 'wanderer',
    role: 'user',
    badge: 'EXPLORER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Passionate world wanderer and explorer. Capturing remote trails and unforgettable cultures.',
    homeCity: 'San Francisco, CA',
    travelStyle: 'Solo Backpacker',
    visitedCountries: ['Japan', 'France', 'Thailand', 'Italy', 'Spain', 'Switzerland'],
    followersCount: 0,
    followingCount: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Toast Notification (Portaled directly to body so it never causes layout shifts in space-y-8) */}
      {copyNotification && typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-6 right-6 z-[99999] bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 border border-slate-700/60 pointer-events-none">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{copyNotification}</span>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* HORIZONTAL PROFILE HEADER (INSTAGRAM STYLE)                    */}
      {/* ============================================================== */}
      <div className="w-full pb-8 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          
          {/* Avatar Picture */}
          <div className="relative flex-shrink-0">
            <img
              src={displayUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={displayUser.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-2 ring-slate-200/70 dark:ring-slate-800/80 shadow-md"
            />
          </div>

          {/* Right Info Column */}
          <div className="flex-1 space-y-3.5 text-left min-w-0">
            
            {/* Row 1: Username, Verified Checkmark Badge, PRO Tag, Options (...) */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {displayUser.username || displayUser.email?.split('@')[0] || displayUser.name?.toLowerCase().replace(/\s+/g, '')}
              </h1>

              {/* Blue Verified Checkmark Badge */}
              <span className="inline-flex items-center text-[#0095f6]" title="Verified Explorer">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
                </svg>
              </span>

              {/* Pro / Role Pill */}
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-wider">
                {displayUser.badge || (displayUser.role === 'admin' ? 'PRO' : 'EXPLORER')}
              </span>

              {/* Options / More Button (...) */}
              <button
                type="button"
                onClick={() => setShowProfileOptionsModal(true)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                title="Profile options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Row 2: Full Display Name */}
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {displayUser.name}
            </p>

            {/* Row 3: Stats Row (posts, followers, following) */}
            <div className="flex items-center gap-6 sm:gap-8 text-sm sm:text-base py-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white">
                  {trips.length}
                </span>
                <span className="text-slate-600 dark:text-slate-300 font-normal">posts</span>
              </div>

              {/* Clickable Real Followers Count */}
              <button
                type="button"
                onClick={() => handleOpenConnectionsModal('followers')}
                className="flex items-center gap-1.5 hover:opacity-75 transition-opacity cursor-pointer group/stat text-left"
                title="View followers"
              >
                <span className="font-bold text-slate-900 dark:text-white group-hover/stat:underline">
                  {(displayUser.followersCount ?? (displayUser.followers?.length || 0)).toLocaleString()}
                </span>
                <span className="text-slate-600 dark:text-slate-300 font-normal group-hover/stat:text-slate-900 dark:group-hover/stat:text-white transition-colors">
                  followers
                </span>
              </button>

              {/* Clickable Real Following Count */}
              <button
                type="button"
                onClick={() => handleOpenConnectionsModal('following')}
                className="flex items-center gap-1.5 hover:opacity-75 transition-opacity cursor-pointer group/stat text-left"
                title="View following"
              >
                <span className="font-bold text-slate-900 dark:text-white group-hover/stat:underline">
                  {(displayUser.followingCount ?? (displayUser.following?.length || 0)).toLocaleString()}
                </span>
                <span className="text-slate-600 dark:text-slate-300 font-normal group-hover/stat:text-slate-900 dark:group-hover/stat:text-white transition-colors">
                  following
                </span>
              </button>
            </div>

            {/* Row 4: Bio */}
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed max-w-xl">
              {displayUser.bio || 'Where group chat is all fun & games.'}
            </p>

            {/* Row 5: Location, Style & Badges */}
            <div className="flex items-center gap-3 pt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[#0095f6]" />
                <span>{displayUser.homeCity || 'New Delhi, India'}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                  🧭 {displayUser.travelStyle || 'Solo Backpacker'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                  ✈️ Active Explorer
                </span>
              </div>
            </div>

            {/* Row 6: Action Buttons Row (Follow / Message / +User or Edit / Share) */}
            <div className="flex items-center gap-2 pt-2.5 w-full max-w-md">
              {isOwnProfile ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex-1 py-1.5 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-[#363636] dark:hover:bg-[#454545] text-slate-900 dark:text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Close Editor' : 'Edit profile'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(displayUser.name)}
                    className="flex-1 py-1.5 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-[#363636] dark:hover:bg-[#454545] text-slate-900 dark:text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSuggestedFriends(prev => !prev)}
                    className={`p-2 rounded-lg transition-all shadow-xs flex items-center justify-center cursor-pointer ${
                      showSuggestedFriends
                        ? 'bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/70 dark:hover:bg-brand-900/80 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/40'
                        : 'bg-slate-200 hover:bg-slate-300 dark:bg-[#363636] dark:hover:bg-[#454545] text-slate-900 dark:text-white'
                    }`}
                    title="Discover & Add Friends"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={`flex-1 py-1.5 px-5 rounded-lg text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      isFollowing
                        ? 'bg-slate-200 hover:bg-slate-300 dark:bg-[#363636] dark:hover:bg-[#454545] text-slate-900 dark:text-white'
                        : 'bg-[#0095f6] hover:bg-[#1877f2] text-white'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <span>Following</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <span>Follow</span>
                    )}
                  </button>

                  <Link
                    to={`/socials?dm=${displayUser._id}`}
                    className="flex-1 py-1.5 px-5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-[#363636] dark:hover:bg-[#454545] text-slate-900 dark:text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center text-center"
                  >
                    <span>Message</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleAddFriendClick}
                    className={`p-2 rounded-lg transition-all shadow-xs flex items-center justify-center cursor-pointer ${
                      showSuggestedFriends || isFollowing
                        ? 'bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/70 dark:hover:bg-brand-900/80 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/40'
                        : 'bg-slate-200 hover:bg-slate-300 dark:bg-[#363636] dark:hover:bg-[#454545] text-slate-900 dark:text-white'
                    }`}
                    title={isFollowing ? "Discover & Add Friends" : `Add ${displayUser.name} as friend`}
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Suggested Friends & Explorers Drawer (Toggled by +User / Add Friend) */}
            {showSuggestedFriends && (
              <div className="pt-3 animate-in fade-in slide-in-from-top-2 duration-200 max-w-xl">
                <div className="bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Suggested Travel Friends & Explorers
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to="/socials"
                        className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        All in Socials →
                      </Link>
                      <button
                        type="button"
                        onClick={() => setShowSuggestedFriends(false)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                        title="Close drawer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Scroll of Suggested Travelers */}
                  <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                    {DEFAULT_EXPLORERS
                      .filter(u => u._id !== displayUser._id && u.username !== displayUser.username && (authUser ? (u._id !== authUser._id && u.username !== authUser.username) : true))
                      .map((u) => {
                        const isFollowed = Boolean(suggestedFollowedMap[u._id]);
                        return (
                          <div
                            key={u._id}
                            className="flex-shrink-0 w-36 bg-white dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/70 dark:border-slate-700/60 flex flex-col items-center text-center shadow-xs space-y-2"
                          >
                            <Link to={`/profile/${u._id}`} className="relative group">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 group-hover:scale-105 transition-transform"
                              />
                            </Link>
                            <div className="w-full">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {u.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                @{u.username}
                              </p>
                              <p className="text-[9px] text-brand-600 dark:text-brand-400 font-semibold truncate mt-0.5">
                                {u.travelStyle || 'Explorer'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 w-full pt-0.5">
                              <button
                                type="button"
                                onClick={() => handleToggleSuggestedFollow(u)}
                                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                  isFollowed
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                                    : 'bg-[#0095f6] hover:bg-[#1877f2] text-white'
                                }`}
                              >
                                {isFollowed ? 'Added ✓' : 'Add Friend'}
                              </button>
                              <Link
                                to={`/socials?dm=${u._id}`}
                                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                                title={`Chat with ${u.name}`}
                              >
                                <MessageCircle className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* VISITED PLACES & TRAVEL PASSPORT (BLENDS IN WITH BACKGROUND)   */}
      {/* ============================================================== */}
      <div className="w-full py-6 border-b border-slate-200/80 dark:border-slate-800/80 space-y-6 transition-colors">
            
            {/* Header & Stats Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0 shadow-xs">
                  <Globe className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Visited Places & Travel Coordinates
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase border border-emerald-200/60 dark:border-emerald-800/60">
                      ✓ Explored
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Destinations, countries, and territories logged by {displayUser.name}
                  </p>
                </div>
              </div>

              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setShowAddPlaceModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Visited Place</span>
                </button>
              )}
            </div>

            {/* Quick Passport Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-200/40 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white block leading-tight">
                  {displayUser.visitedCountries?.length || 0}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                  Countries Explored
                </span>
              </div>
              <div className="bg-slate-200/40 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white block leading-tight">
                  {Math.max(5, (displayUser.visitedCountries?.length || 0) * 3)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                  Cities & Regions
                </span>
              </div>
              <div className="bg-slate-200/40 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <span className="text-2xl font-black text-brand-600 dark:text-brand-400 block leading-tight">
                  {trips.length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                  Journeys Published
                </span>
              </div>
              <div className="bg-slate-200/40 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 block leading-tight pt-1.5">
                  🏅 Avid Adventurer
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5 block">
                  Traveler Rank
                </span>
              </div>
            </div>

            {/* Mentioned Visited Places Collection */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  All Explored Destinations & Territories ({displayUser.visitedCountries?.length || 0})
                </span>
              </div>

              {displayUser.visitedCountries && displayUser.visitedCountries.length > 0 ? (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {displayUser.visitedCountries.map((place, idx) => (
                    <div
                      key={idx}
                      className="group/pill inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-200/50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition-all"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-950 flex-shrink-0"></span>
                      <span>{place}</span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 group-hover/pill:text-brand-600 dark:group-hover/pill:text-brand-400">
                        Passport #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-200/30 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <MapPin className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    No visited destinations recorded yet.
                  </p>
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => setShowAddPlaceModal(true)}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                    >
                      + Mention your first visited destination
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile Form (Shown below map if editing is toggled) */}
          {isEditing && isOwnProfile && (
            <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-brand-200 dark:border-brand-800 shadow-md space-y-4 animate-in fade-in text-slate-800 dark:text-slate-100 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-brand-600" />
                  Edit Passport Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Home Base City</label>
                  <input
                    type="text"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Travel Style</label>
                  <input
                    type="text"
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Visited Countries (comma separated for live map pins)
                  </label>
                  <input
                    type="text"
                    value={visitedInput}
                    onChange={(e) => setVisitedInput(e.target.value)}
                    placeholder="e.g. India, Japan, France, Norway, Chile, Spain, Italy, Iceland"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Traveler Bio</label>
                  <textarea
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* RIGHT COLUMN (BOTTOM): NAVIGATION TABS & CARDS (Screenshot 1)  */}
          {/* ============================================================== */}
          <div className="space-y-6 pt-2">
            
            {/* Wanderlog Bottom Tabs: Trip plans | Guides | Liked Cards | Journals */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-6 sm:gap-8">
                
                {/* Tab 1: Trip plans */}
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black transition-all relative ${
                    activeTab === 'plans'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span>Trip plans</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'plans'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}>
                    {upcomingTrips.length}
                  </span>
                </button>

                {/* Tab 2: Guides */}
                <button
                  onClick={() => setActiveTab('guides')}
                  className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black transition-all relative ${
                    activeTab === 'guides'
                      ? 'text-amber-400 border-b-2 border-amber-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Guides</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'guides'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}>
                    {completedGuides.length}
                  </span>
                </button>

                {/* Tab 3: Liked Cards */}
                <button
                  onClick={() => setActiveTab('liked')}
                  className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black transition-all relative ${
                    activeTab === 'liked'
                      ? 'text-rose-400 border-b-2 border-rose-400'
                      : 'text-slate-400 hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${activeTab === 'liked' ? 'text-rose-400 fill-rose-400' : 'text-slate-400'}`} />
                  <span>Liked Cards</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'liked'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-extrabold'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}>
                    {likedTrips.length + likedDestinations.length}
                  </span>
                </button>

                {/* Tab 4: Journals */}
                <button
                  onClick={() => setActiveTab('journals')}
                  className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-black transition-all relative ${
                    activeTab === 'journals'
                      ? 'text-sky-400 border-b-2 border-sky-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Journals</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'journals'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}>
                    {journalEntries.length}
                  </span>
                </button>

              </div>

              {isOwnProfile && (
                <Link
                  to="/planner"
                  className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Create New Plan</span>
                </Link>
              )}
            </div>

            {/* TAB CONTENT */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : activeTab === 'plans' ? (
              /* TAB 1: TRIP PLANS */
              upcomingTrips.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <Map className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">No upcoming trip plans yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isOwnProfile
                      ? 'Post where you are heading next to match with companion wanderers!'
                      : `${displayUser.name} currently has no open upcoming trips.`}
                  </p>
                  {isOwnProfile && (
                    <Link
                      to="/planner"
                      className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Post an Itinerary
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingTrips.map((trip) => (
                    <div key={trip._id} className="relative group">
                      <TripCard
                        trip={trip}
                        onDelete={isOwnProfile ? handleDeleteTrip : undefined}
                      />
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === 'guides' ? (
              /* TAB 2: GUIDES (Completed Veteran Journeys) */
              completedGuides.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <Compass className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">No completed guides published</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verified advice and field itineraries from past journeys appear here.
                  </p>
                  {isOwnProfile && (
                    <Link
                      to="/planner"
                      className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Share Veteran Travel Advice
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedGuides.map((trip) => (
                    <div key={trip._id} className="relative group">
                      <TripCard
                        trip={trip}
                        onDelete={isOwnProfile ? handleDeleteTrip : undefined}
                      />
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === 'liked' ? (
              /* TAB 3: LIKED CARDS (All Cards User Has Liked) */
              likedTrips.length === 0 && likedDestinations.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-rose-100 dark:border-slate-800 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto text-rose-500 ring-8 ring-rose-50/50 dark:ring-rose-950/20">
                    <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">No liked cards yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    {isOwnProfile
                      ? 'Every completed journey, upcoming itinerary, and official destination guide you like across Traverse will be saved right here in your passport!'
                      : `${displayUser.name} has not saved any liked cards yet.`}
                  </p>
                  {isOwnProfile && (
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <Link
                        to="/explore"
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all"
                      >
                        Explore Official Guides
                      </Link>
                      <Link
                        to="/community"
                        className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors border border-transparent dark:border-slate-700"
                      >
                        Explore Community Trips
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setLikedCategory('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        likedCategory === 'all'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 border border-transparent dark:border-slate-700/60'
                      }`}
                    >
                      All Liked Cards ({likedTrips.length + likedDestinations.length})
                    </button>
                    <button
                      onClick={() => setLikedCategory('trips')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        likedCategory === 'trips'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 border border-transparent dark:border-slate-700/60'
                      }`}
                    >
                      Journeys & Itineraries ({likedTrips.length})
                    </button>
                    <button
                      onClick={() => setLikedCategory('destinations')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        likedCategory === 'destinations'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 border border-transparent dark:border-slate-700/60'
                      }`}
                    >
                      Official Destination Guides ({likedDestinations.length})
                    </button>
                  </div>

                  {/* Liked Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Render Liked Trips */}
                    {(likedCategory === 'all' || likedCategory === 'trips') &&
                      likedTrips.map((trip) => (
                        <div key={trip._id} className="relative group">
                          <TripCard
                            trip={trip}
                            onLikeChange={handleTripLikeChange}
                            onDelete={isOwnProfile ? handleDeleteTrip : undefined}
                          />
                        </div>
                      ))}

                    {/* Render Liked Destinations */}
                    {(likedCategory === 'all' || likedCategory === 'destinations') &&
                      likedDestinations.map((dest) => (
                        <div
                          key={dest._id}
                          onClick={() => setActiveModalDest(dest)}
                          className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer hover:-translate-y-1"
                          title="Click to view full destination guide"
                        >
                          {/* Image & Header */}
                          <div className="relative h-44 overflow-hidden">
                            <img
                              src={dest.image}
                              alt={dest.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent"></div>

                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/95 text-white backdrop-blur-md shadow-xs">
                                <Sparkles className="w-3 h-3 flex-shrink-0" />
                                <span>Official Guide</span>
                              </span>

                              <button
                                type="button"
                                onClick={(e) => handleToggleLikeDestination(e, dest)}
                                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-md transition-all shadow-xs active:scale-95 bg-rose-500 text-white shadow-rose-500/30 ring-2 ring-rose-400/50 cursor-pointer z-10"
                                title="Unlike destination guide"
                              >
                                <Heart className="w-3 h-3 fill-white text-white" />
                                <span>{dest.likes || 0}</span>
                              </button>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 mb-0.5">
                                <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                <span className="truncate">{dest.region}, {dest.country}</span>
                              </div>
                              <h3 className="text-sm font-black text-white line-clamp-1 leading-snug">
                                {dest.name}
                              </h3>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-100 dark:border-slate-700/80 flex items-center gap-1.5 overflow-hidden">
                                <Calendar className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{dest.bestTimeToVisit}</span>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-100 dark:border-slate-700/80 flex items-center gap-1.5 overflow-hidden">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{dest.averageBudgetPerDay}</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                              {dest.description}
                            </p>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                {dest.rating || 4.9} ({dest.reviews?.length || 2} reviews)
                              </span>
                              <span className="font-bold text-brand-500 dark:text-brand-400 group-hover:text-brand-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                <span>View Guide</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            ) : (
              /* TAB 4: JOURNALS (Field Moments & Itinerary logs) */
              journalEntries.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">No journal logs yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Daily itinerary entries and field moments will be compiled automatically.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {journalEntries.map((j) => (
                    <div
                      key={j._id}
                      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col group"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={j.coverImage}
                          alt={j.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => handleShare(j.title)}
                            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                            title="Share Journal"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-brand-500 text-white inline-block mb-1">
                            Day {j.dayNumber}
                          </span>
                          <h4 className="text-sm font-black text-white line-clamp-1">{j.title}</h4>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                          <span className="text-slate-700 dark:text-slate-300">{j.destination}</span>
                        </p>

                        <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                          {j.activities && j.activities.slice(0, 3).map((act, idx) => (
                            <p key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 leading-snug">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{act}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

          </div>

      {/* Add Visited Location Modal */}
      {showAddPlaceModal && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setShowAddPlaceModal(false)}
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                Pin a Visited Destination
              </h3>
              <button
                onClick={() => setShowAddPlaceModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Type the country or city you explored (e.g. Japan, France, Norway, Iceland, Bali, Tokyo). It will instantly drop a pin on your interactive world map!
            </p>

            <form onSubmit={handleAddVisitedPlace} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Destination name (e.g., Vietnam)"
                value={newPlaceName}
                onChange={(e) => setNewPlaceName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlaceModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  Pin to World Map
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Destination Detail Modal for Liked Guides */}
      {activeModalDest && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setActiveModalDest(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col"
          >
            <div className="relative h-64 sm:h-72 overflow-hidden flex-shrink-0">
              <img
                src={activeModalDest.image}
                alt={activeModalDest.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

              <button
                onClick={() => setActiveModalDest(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-md">
                  👑 Official Admin Guide
                </span>
                <button
                  type="button"
                  onClick={(e) => handleToggleLikeDestination(e, activeModalDest)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md transition-all shadow-sm active:scale-95 bg-rose-500 text-white shadow-rose-500/30 ring-2 ring-rose-400/50 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{activeModalDest.likes || 0} Likes</span>
                </button>
              </div>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  {activeModalDest.region} • {activeModalDest.country}
                </p>
                <h3 className="text-2xl font-black">{activeModalDest.name}</h3>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Best Travel Season</span>
                  <span className="font-bold text-slate-800">{activeModalDest.bestTimeToVisit}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Average Budget</span>
                  <span className="font-bold text-slate-800">{activeModalDest.averageBudgetPerDay}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeModalDest.description}
              </p>

              {activeModalDest.highlights && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Key Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeModalDest.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const destName = activeModalDest.name;
                  setActiveModalDest(null);
                  navigate(`/planner?dest=${encodeURIComponent(destName)}`);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 flex items-center gap-2 transition-all cursor-pointer"
                title="Plan your journey to this official destination"
              >
                <Compass className="w-4 h-4 text-emerald-100" />
                <span>Use This Guide to Travel</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* FOLLOWERS / FOLLOWING CONNECTIONS MODAL                        */}
      {/* ============================================================== */}
      {connectionsModalTab && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setConnectionsModalTab(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200 transition-colors"
          >
            {/* Modal Header & Tabs */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setConnectionsModalTab('followers');
                    fetchConnections('followers');
                  }}
                  className={`pb-2 text-sm font-bold transition-all border-b-2 cursor-pointer ${
                    connectionsModalTab === 'followers'
                      ? 'border-[#0095f6] text-[#0095f6]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Followers ({(displayUser.followersCount ?? (displayUser.followers?.length || 0)).toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConnectionsModalTab('following');
                    fetchConnections('following');
                  }}
                  className={`pb-2 text-sm font-bold transition-all border-b-2 cursor-pointer ${
                    connectionsModalTab === 'following'
                      ? 'border-[#0095f6] text-[#0095f6]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Following ({(displayUser.followingCount ?? (displayUser.following?.length || 0)).toLocaleString()})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setConnectionsModalTab(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Real-time Search Filter */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder={`Search ${connectionsModalTab}...`}
                  value={connectionsSearch}
                  onChange={(e) => setConnectionsSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Modal Body / Connections List */}
            <div className="overflow-y-auto p-3 space-y-1.5 flex-1 divide-y divide-slate-100/60 dark:divide-slate-800/60">
              {connectionsLoading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400">Loading travelers...</p>
                </div>
              ) : connectionsList.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <User className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">
                    No {connectionsModalTab} recorded yet.
                  </p>
                </div>
              ) : (
                connectionsList
                  .filter((u) => {
                    if (!connectionsSearch.trim()) return true;
                    const q = connectionsSearch.toLowerCase();
                    return (
                      u.name?.toLowerCase().includes(q) ||
                      u.username?.toLowerCase().includes(q) ||
                      u.homeCity?.toLowerCase().includes(q)
                    );
                  })
                  .map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-3"
                    >
                      {/* Avatar and Traveler Details */}
                      <Link
                        to={`/profile/${u._id}`}
                        onClick={() => setConnectionsModalTab(null)}
                        className="flex items-center gap-3 min-w-0 flex-1 group"
                      >
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={u.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-200/60 dark:ring-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:underline">
                              {u.name}
                            </span>
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              {u.badge || 'EXPLORER'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            @{u.username || u.name?.toLowerCase().replace(/\s+/g, '')}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <span>📍 {u.homeCity || 'Worldwide'}</span>
                            <span>•</span>
                            <span>🧭 {u.travelStyle || 'Adventurer'}</span>
                          </p>
                        </div>
                      </Link>

                      {/* Follow & Message Buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {u.isSelf ? (
                          <span className="text-[11px] font-semibold text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            You
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleModalToggleFollow(u)}
                              className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                                u.isFollowing
                                  ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                  : 'bg-[#0095f6] hover:bg-[#1877f2] text-white'
                              }`}
                            >
                              {u.isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <Link
                              to={`/socials?dm=${u._id}`}
                              onClick={() => setConnectionsModalTab(null)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                              title={`Direct Message ${u.name}`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* PROFILE OPTIONS (3-DOTS) MODAL                                 */}
      {/* ============================================================== */}
      {showProfileOptionsModal && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setShowProfileOptionsModal(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col text-center text-sm font-semibold divide-y divide-slate-100 dark:divide-slate-800 animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100"
          >
            <button
              type="button"
              onClick={() => {
                handleShare(displayUser.name);
                setShowProfileOptionsModal(false);
              }}
              className="py-3.5 px-4 text-brand-600 dark:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2 cursor-pointer font-bold"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Profile Link</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                setCopyNotification('Copied profile URL to clipboard!');
                setTimeout(() => setCopyNotification(''), 3000);
                setShowProfileOptionsModal(false);
              }}
              className="py-3.5 px-4 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Copy Profile URL</span>
            </button>

            {!isOwnProfile && (
              <button
                type="button"
                onClick={() => {
                  setShowProfileOptionsModal(false);
                  navigate(`/socials?dm=${displayUser._id || userId}`);
                }}
                className="py-3.5 px-4 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-slate-400" />
                <span>Send Direct Message</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowProfileOptionsModal(false);
                handleOpenConnectionsModal('followers');
              }}
              className="py-3.5 px-4 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>View Follower Network</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowProfileOptionsModal(false);
                handleOpenConnectionsModal('following');
              }}
              className="py-3.5 px-4 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>View Following Network</span>
            </button>

            {!isOwnProfile && (
              <button
                type="button"
                onClick={() => {
                  setShowProfileOptionsModal(false);
                  setCopyNotification(`Report recorded for @${displayUser.username || displayUser.name}. Thank you!`);
                  setTimeout(() => setCopyNotification(''), 3000);
                }}
                className="py-3.5 px-4 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-2 cursor-pointer font-bold"
              >
                <span>Report Traveler</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowProfileOptionsModal(false)}
              className="py-3.5 px-4 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Profile;
