import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Compass, 
  MessageSquare, 
  Mail, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Pin,
  Calendar,
  Award,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'trips', 'inquiries', 'chat'
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, tripsRes, inqRes, chatRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/trips'),
        fetch('/api/contact/inquiries', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/chat/messages?channel=general')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (tripsRes.ok) setTrips(await tripsRes.json());
      if (inqRes.ok) setInquiries(await inqRes.json());
      if (chatRes.ok) setChatMessages(await chatRes.json());
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setActionMessage(`User role successfully changed to ${newRole}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActionMessage('User deleted successfully.');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Delete this trip from the platform?')) return;
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActionMessage('Trip removed by Admin.');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInquiryStatus = async (inqId, status, adminNotes = '') => {
    try {
      const res = await fetch(`/api/contact/inquiries/${inqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNotes })
      });
      if (res.ok) {
        setActionMessage('Inquiry updated.');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePinChat = async (msgId) => {
    try {
      const res = await fetch(`/api/chat/messages/${msgId}/pin`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200 dark:border-amber-500/30 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Traverse Admin Operations
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Platform governance, companion safety, user moderation, and support inquiries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/community"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Visit Community
          </Link>
          <Link
            to="/socials"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
          >
            Open Socials Hub
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Metrics Overview', icon: Compass },
          { id: 'users', label: 'User Directory', count: users.length, icon: Users },
          { id: 'trips', label: 'Trip Itineraries', count: trips.length, icon: Calendar },
          { id: 'inquiries', label: 'Support Inquiries', count: inquiries.length, icon: Mail },
          { id: 'chat', label: 'Chat Moderation', icon: MessageSquare }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 dark:bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Users</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</p>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Verified Wanderers</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Trips</span>
              <p className="text-3xl font-black text-ocean-600 dark:text-ocean-400">{stats.totalTrips}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Active & Completed</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Traveling Same Time</span>
              <p className="text-3xl font-black text-brand-600 dark:text-brand-400">{stats.sameTimeTrips}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Live Synchronous</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pending Inquiries</span>
              <p className="text-3xl font-black text-amber-500 dark:text-amber-400">{stats.pendingInquiries}</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">Require Attention</p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Recent Trips */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Recent Platform Itineraries</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">Latest submissions</span>
              </h3>
              <div className="space-y-3">
                {stats.recentTrips?.map((rt) => (
                  <div key={rt._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                    <div className="overflow-hidden pr-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{rt.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{rt.destination} • {rt.creatorName}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rt.status === 'completed' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' : 'bg-brand-100 dark:bg-brand-950/70 text-brand-800 dark:text-brand-300'
                    }`}>
                      {rt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Admin Actions & Status */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4 flex flex-col justify-between border border-slate-800">
              <div>
                <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">System Health</span>
                <h3 className="text-xl font-bold text-white mt-1">Platform Operations Normal</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Real-time WebSocket active. Data persistence operational. Global traveler channels active.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 font-bold text-center text-white"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className="p-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-bold text-center text-white shadow-sm"
                >
                  View Inquiries ({stats.pendingInquiries})
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Registered Users Directory</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{users.length} members total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Travel Style</th>
                  <th className="p-4">Home Base</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{u.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{u.travelStyle || 'Wanderer'}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{u.homeCity || 'Worldwide'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRIPS MODERATION */}
      {activeTab === 'trips' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">All Platform Trips</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{trips.length} itineraries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-4">Trip Title & Destination</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Companions</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {trips.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{t.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.destination}, {t.country}</p>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">{t.creatorName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'completed'
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                          : 'bg-brand-100 dark:bg-brand-950/70 text-brand-800 dark:text-brand-300'
                      }`}>
                        {t.status === 'completed' ? 'Done Travel (Veteran)' : 'Same Time (Active)'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{t.startDate} - {t.endDate}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t.companions?.length || 0} joined</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleDeleteTrip(t._id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">User Contact Submissions</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{inquiries.length} inquiries</span>
          </div>

          <div className="p-5 space-y-4">
            {inquiries.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No support tickets found.</p>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq._id}
                  className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{inq.subject}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        From: <span className="font-semibold text-slate-700 dark:text-slate-200">{inq.name}</span> ({inq.email}) • Topic: <span className="font-semibold text-slate-700 dark:text-slate-300">{inq.category}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateInquiryStatus(inq._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                          inq.status === 'resolved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                            : inq.status === 'in_progress'
                            ? 'bg-ocean-50 dark:bg-ocean-950/60 text-ocean-800 dark:text-ocean-300 border-ocean-300 dark:border-ocean-700'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 leading-relaxed">
                    {inq.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span>Submitted: {new Date(inq.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CHAT MODERATION */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4 p-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Global Chat Moderation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pin community announcements or remove flagged messages.</p>
            </div>
            <Link
              to="/socials"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Open Socials Hub
            </Link>
          </div>

          <div className="space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg._id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs">
                <div className="overflow-hidden pr-3 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">#{msg.channel}</span>
                    {msg.pinned && (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 px-1.5 rounded">Pinned</span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 truncate">{msg.message}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePinChat(msg._id)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Toggle Pin"
                  >
                    <Pin className={`w-3.5 h-3.5 ${msg.pinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

