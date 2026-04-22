const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");
const { getPagination } = require("../utils/paginateQuery");

const conversationPopulate = {
  path: "participants",
  select: "username name profilePicture"
};

const listConversations = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate(conversationPopulate)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Conversation.countDocuments({
      participants: req.user._id
    });

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: req.user._id },
          readBy: { $ne: req.user._id }
        });

        return {
          ...conversation.toObject(),
          unreadCount
        };
      })
    );

    return res.status(200).json({
      items: conversationsWithUnread,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

const startConversation = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Recipient username is required" });
    }

    const recipient = await User.findOne({ username }).select("username name profilePicture");

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipient._id], $size: 2 }
    }).populate(conversationPopulate);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipient._id]
      });
      conversation = await Conversation.findById(conversation._id).populate(conversationPopulate);
    }

    return res.status(201).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: "Failed to start conversation" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "You do not have access to this conversation" });
    }

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversation._id })
        .populate("sender", "username name profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversation: conversation._id })
    ]);

    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      {
        $addToSet: { readBy: req.user._id }
      }
    );

    return res.status(200).json({
      items: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const trimmedText = text?.trim() || "";

    if (!trimmedText) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "You do not have access to this conversation" });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: trimmedText
    });

    conversation.lastMessage = trimmedText;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const recipient = conversation.participants.find(
      (participant) => participant.toString() !== req.user._id.toString()
    );

    await createNotification({
      recipient,
      sender: req.user._id,
      type: "message",
      conversation: conversation._id,
      text: trimmedText.length > 80 ? `${trimmedText.slice(0, 80)}...` : trimmedText
    });

    return res.status(201).json(
      await Message.findById(message._id).populate("sender", "username name profilePicture")
    );
  } catch (error) {
    return res.status(500).json({ message: "Failed to send message" });
  }
};

module.exports = { listConversations, startConversation, getMessages, sendMessage };
