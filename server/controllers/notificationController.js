const Notification = require("../models/Notification");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { getPagination } = require("../utils/paginateQuery");

const getNotifications = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .populate("sender", "username name profilePicture")
        .populate("post", "text imageUrl")
        .populate("conversation", "participants")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: req.user._id })
    ]);

    return res.status(200).json({
      items: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    return res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update notifications" });
  }
};

const getUnreadSummary = async (req, res) => {
  try {
    const [unreadNotifications, unreadMessages] = await Promise.all([
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
      Message.aggregate([
        {
          $match: {
            sender: { $ne: req.user._id },
            readBy: { $ne: req.user._id }
          }
        },
        {
          $lookup: {
            from: "conversations",
            localField: "conversation",
            foreignField: "_id",
            as: "conversationDoc"
          }
        },
        { $unwind: "$conversationDoc" },
        {
          $match: {
            "conversationDoc.participants": req.user._id
          }
        },
        { $count: "count" }
      ])
    ]);

    return res.status(200).json({
      unreadNotifications,
      unreadMessages: unreadMessages[0]?.count || 0
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch unread summary" });
  }
};

module.exports = { getNotifications, markNotificationsRead, getUnreadSummary };
