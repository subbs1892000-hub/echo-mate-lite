const User = require("../models/User");
const Post = require("../models/Post");
const { isValidUrl } = require("../utils/validators");
const createNotification = require("../utils/createNotification");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("followers", "username name profilePicture")
      .populate("following", "username name profilePicture");

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name = "", bio = "", profilePicture = "" } = req.body;

    if (bio.length > 200) {
      return res.status(400).json({ message: "Bio must be 200 characters or fewer" });
    }

    if (!isValidUrl(profilePicture)) {
      return res.status(400).json({ message: "Please provide a valid profile picture URL" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name.trim(),
        bio: bio.trim(),
        profilePicture: profilePicture.trim()
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers", "username name profilePicture")
      .populate("following", "username name profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ user: user._id })
      .populate("user", "username name profilePicture")
      .populate("comments.user", "username name profilePicture")
      .sort({ createdAt: -1 });

    const isFollowing = user.followers.some(
      (follower) => follower._id.toString() === req.user._id.toString()
    );

    return res.status(200).json({
      user,
      posts,
      stats: {
        posts: posts.length,
        followers: user.followers.length,
        following: user.following.length
      },
      isOwnProfile: user._id.toString() === req.user._id.toString(),
      isFollowing
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch public profile" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();

    if (!query) {
      return res.status(200).json([]);
    }

    const regex = new RegExp(query, "i");
    const users = await User.find({
      $or: [{ username: regex }, { name: regex }, { bio: regex }]
    })
      .select("username name bio profilePicture followers following")
      .sort({ createdAt: -1 })
      .limit(8);

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Failed to search users" });
  }
};

const toggleFollowUser = async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.some(
      (userId) => userId.toString() === targetUser._id.toString()
    );

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (userId) => userId.toString() !== targetUser._id.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        (userId) => userId.toString() !== currentUser._id.toString()
      );
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
    }

    await currentUser.save();
    await targetUser.save();

    if (!isFollowing) {
      await createNotification({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: "follow",
        text: "started following you"
      });
    }

    return res.status(200).json({
      message: isFollowing ? "User unfollowed" : "User followed",
      isFollowing: !isFollowing
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update follow status" });
  }
};

module.exports = { getProfile, updateProfile, getPublicProfile, searchUsers, toggleFollowUser };
