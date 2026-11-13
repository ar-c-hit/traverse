import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../utils/apiConfig';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [currentChannel, setCurrentChannel] = useState('general');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [channelUsers, setChannelUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [directMessageUpdate, setDirectMessageUpdate] = useState(null);

  const currentChannelRef = useRef(currentChannel);
  const prevChannelRef = useRef('general');

  useEffect(() => {
    currentChannelRef.current = currentChannel;
  }, [currentChannel]);

  // Initialize socket
  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    setSocket(s);

    s.on('connect', () => {
      s.emit('join_channel', { channel: currentChannelRef.current || 'general', user });
      if (user && user._id) {
        s.emit('register_user', user._id);
      }
    });

    s.on('online_count', (count) => {
      setOnlineCount(count);
    });

    s.on('online_users', (ids) => {
      if (Array.isArray(ids)) setOnlineUsers(ids);
    });

    fetch('/api/auth/online-users')
      .then((res) => (res.ok ? res.json() : []))
      .then((ids) => {
        if (Array.isArray(ids)) setOnlineUsers(ids);
      })
      .catch(() => {});

    s.on('channel_users_update', (users) => {
      setChannelUsers(users);
    });

    s.on('receive_message', (msg) => {
      // Only append to active messages feed if it matches current channel
      if (msg.channel === currentChannelRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      if (msg.isDirect || (msg.channel && msg.channel.startsWith('dm_'))) {
        setDirectMessageUpdate(msg);
      }
    });

    s.on('direct_message_received', (msg) => {
      if (msg.channel === currentChannelRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      setDirectMessageUpdate(msg);
    });

    s.on('message_deleted', (msgId) => {
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    });

    s.on('message_updated', (updated) => {
      setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
    });

    s.on('user_typing', ({ user: typingUser, channel }) => {
      if (!channel || channel === currentChannelRef.current) {
        setTypingUsers((prev) => {
          if (!prev.some((u) => u.name === typingUser.name)) {
            return [...prev, typingUser];
          }
          return prev;
        });
      }
    });

    s.on('user_stop_typing', ({ user: typingUser, channel }) => {
      if (!channel || channel === currentChannelRef.current) {
        setTypingUsers((prev) => prev.filter((u) => u.name !== typingUser.name));
      }
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Sync user updates to socket
  useEffect(() => {
    if (socket && socket.connected) {
      socket.emit('join_channel', { channel: currentChannel, user });
      if (user && user._id) {
        socket.emit('register_user', user._id);
      }
    }
  }, [user, socket]);

  // Fetch messages when currentChannel changes
  useEffect(() => {
    let isSubscribed = true;

    const fetchChannelMessages = async () => {
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/chat/messages?channel=${currentChannel}`, { headers });
        if (res.ok && isSubscribed) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchChannelMessages();

    if (socket && socket.connected) {
      socket.emit('switch_channel', {
        oldChannel: prevChannelRef.current,
        newChannel: currentChannel,
        user,
      });
      prevChannelRef.current = currentChannel;
    }
    setTypingUsers([]);

    return () => {
      isSubscribed = false;
    };
  }, [currentChannel, socket, token]);

  const changeChannel = (channel) => {
    if (channel && channel !== currentChannel) {
      setCurrentChannel(channel);
    }
  };

  const sendMessage = async (text, customChannel = null, recipientId = null) => {
    if (!token || !text.trim()) return;

    const targetChan = customChannel || currentChannel;

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          channel: targetChan,
          recipientId: recipientId ? recipientId.toString() : null
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const newMsg = await res.json();

      if (newMsg.channel === currentChannelRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }

      if (socket) {
        socket.emit('send_message', newMsg);
      }

      setDirectMessageUpdate(newMsg);
      return newMsg;
    } catch (err) {
      console.error('Error in sendMessage:', err);
    }
  };

  const deleteMessage = async (msgId) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/chat/messages/${msgId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== msgId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const notifyTyping = (isTyping) => {
    if (!socket || !user) return;
    if (isTyping) {
      socket.emit('typing', { channel: currentChannel, user });
    } else {
      socket.emit('stop_typing', { channel: currentChannel, user });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        currentChannel,
        changeChannel,
        messages,
        sendMessage,
        deleteMessage,
        typingUsers,
        notifyTyping,
        onlineCount,
        onlineUsers,
        channelUsers,
        loading,
        directMessageUpdate,
        socket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

