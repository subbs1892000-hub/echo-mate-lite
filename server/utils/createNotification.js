const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  sender,
  type,
  post = null,
  conversation = null,
  text = ""
}) => {
  if (!recipient || !sender || recipient.toString() === sender.toString()) {
    return null;
  }

  return Notification.create({
    recipient,
    sender,
    type,
    post,
    conversation,
    text
  });
};

module.exports = createNotification;
