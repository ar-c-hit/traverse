const Store = require('../utils/store');
const { createNotification } = require('../utils/notify');

// @desc Get chat messages by channel or direct partner
// @route GET /api/chat/messages
const getChatMessages = async (req, res) => {
  try {
    const { channel, directUser } = req.query;

    let targetChannel = channel || 'general';

    // If direct message with another user
    if (directUser) {
      if (!req.user) {
        return res.status(401).json({ message: 'Must be signed in for direct messages' });
      }
      const u1 = req.user._id.toString();
      const u2 = directUser.toString();
      targetChannel = `dm_${[u1, u2].sort().join('_')}`;
    }

    const messages = await Store.chats.find({ channel: targetChannel });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat messages', error: error.message });
  }
};

// @desc Send chat message (Community channel or Direct Message)
// @route POST /api/chat/messages
const sendChatMessage = async (req, res) => {
  try {
    let { message, channel, recipientId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    let targetChannel = channel || 'general';
    let isDirect = false;

    // Automatically detect direct message from recipientId or channel name
    if (recipientId) {
      const u1 = req.user._id.toString();
      const u2 = recipientId.toString();
      targetChannel = `dm_${[u1, u2].sort().join('_')}`;
      isDirect = true;
    } else if (targetChannel && targetChannel.startsWith('dm_')) {
      const parts = targetChannel.replace('dm_', '').split('_');
      const partnerId = parts.find(p => p !== req.user._id.toString());
      if (partnerId) {
        recipientId = partnerId;
        isDirect = true;
      }
    }

    // Enforce mutual friendship for direct messaging (unless admin)
    if (isDirect && recipientId) {
      const currentUserId = req.user._id.toString();
      const targetId = recipientId.toString();
      if (req.user.role !== 'admin' && currentUserId !== targetId) {
        const currentUser = await Store.users.findById(currentUserId);
        const targetUser = await Store.users.findById(targetId);
        if (currentUser && targetUser) {
          const curFollowing = Array.isArray(currentUser.following) ? currentUser.following.map(id => id.toString()) : [];
          const curFollowers = Array.isArray(currentUser.followers) ? currentUser.followers.map(id => id.toString()) : [];
          const isMutualFriend = curFollowing.includes(targetId) && curFollowers.includes(targetId);
          if (!isMutualFriend) {
            return res.status(403).json({ 
              message: 'Direct messaging requires mutual friendship. Both travelers must follow each other to chat!' 
            });
          }
        }
      }
    }

    const newMessage = await Store.chats.create({
      channel: targetChannel,
      senderId: req.user._id.toString(),
      senderName: req.user.name,
      senderAvatar: req.user.avatar,
      senderRole: req.user.role,
      message: message.trim(),
      recipientId: recipientId ? recipientId.toString() : null,
      isDirect,
      pinned: false
    });

    // If socket.io is accessible via req.app.get('io')
    const io = req.app.get('io');
    if (io) {
      // 1. Emit to the channel room
      io.to(targetChannel).emit('receive_message', newMessage);

      // 2. If direct message, emit directly to recipient's personal room & sender's personal room
      if (recipientId) {
        const recipientRoom = `user_${recipientId.toString()}`;
        const senderRoom = `user_${req.user._id.toString()}`;
        io.to(recipientRoom).emit('receive_message', newMessage);
        io.to(recipientRoom).emit('direct_message_received', newMessage);
        io.to(senderRoom).emit('receive_message', newMessage);

        // Notify recipient about direct message
        if (recipientId.toString() !== req.user._id.toString()) {
          createNotification({
            recipient: recipientId.toString(),
            sender: {
              _id: req.user._id,
              name: req.user.name,
              username: req.user.username,
              avatar: req.user.avatar,
              badge: req.user.badge || 'EXPLORER'
            },
            type: 'message',
            title: 'New Direct Message 💬',
            message: `${req.user.name} sent you a message: "${message.substring(0, 45)}${message.length > 45 ? '...' : ''}"`,
            link: `/socials?user=${req.user._id.toString()}`,
            metadata: { senderId: req.user._id.toString() }
          }, io);
        }
      }

      io.emit('global_message_notification', {
        channel: targetChannel,
        senderName: req.user.name,
        preview: message.substring(0, 40)
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// @desc Get 1-on-1 direct conversations list for current user
// @route GET /api/chat/conversations
const getDirectConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();
    const allChats = await Store.chats.find();

    // Find all DM chats involving the current user
    const dmChats = allChats.filter(c => c.channel && c.channel.startsWith('dm_') && c.channel.includes(currentUserId));

    const partnerIds = new Set();
    dmChats.forEach(c => {
      const parts = c.channel.replace('dm_', '').split('_');
      parts.forEach(pId => {
        if (pId !== currentUserId) partnerIds.add(pId);
      });
    });

    // Also include other travelers so new chats can be started instantly
    const allUsers = await Store.users.find();
    allUsers.forEach(u => {
      if (u._id.toString() !== currentUserId) {
        partnerIds.add(u._id.toString());
      }
    });

    const conversations = [];
    for (const partnerId of partnerIds) {
      const partner = await Store.users.findById(partnerId);
      if (!partner) continue;

      const dmChannel = `dm_${[currentUserId, partnerId].sort().join('_')}`;
      const partnerMsgs = dmChats.filter(c => c.channel === dmChannel);
      const lastMsg = partnerMsgs.length > 0 ? partnerMsgs[partnerMsgs.length - 1] : null;

      conversations.push({
        partnerId: partner._id.toString(),
        _id: partner._id.toString(),
        name: partner.name,
        username: partner.username || partner.email.split('@')[0],
        avatar: partner.avatar,
        role: partner.role,
        badge: partner.role === 'admin' ? 'PRO' : 'EXPLORER',
        homeCity: partner.homeCity || 'Worldwide',
        travelStyle: partner.travelStyle || 'Wanderer',
        lastMessage: lastMsg ? lastMsg.message : 'Say hello and plan adventures together!',
        lastMessageAt: lastMsg ? lastMsg.createdAt : partner.createdAt || new Date(),
        unreadCount: 0
      });
    }

    // Sort conversations with recent messages first
    conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

// @desc Delete chat message
// @route DELETE /api/chat/messages/:id
const deleteChatMessage = async (req, res) => {
  try {
    const msg = await Store.chats.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (msg.senderId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete message' });
    }

    await Store.chats.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) {
      io.to(msg.channel).emit('message_deleted', req.params.id);
    }

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
};

// @desc Pin/Unpin message (Admin only)
// @route PUT /api/chat/messages/:id/pin
const togglePin = async (req, res) => {
  try {
    const msg = await Store.chats.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    const updated = await Store.chats.findByIdAndUpdate(req.params.id, { pinned: !msg.pinned });
    const io = req.app.get('io');
    if (io) {
      io.to(msg.channel).emit('message_updated', updated);
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error pinning message', error: error.message });
  }
};

module.exports = {
  getChatMessages,
  sendChatMessage,
  deleteChatMessage,
  togglePin,
  getDirectConversations
};

