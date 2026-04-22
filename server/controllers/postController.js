const Post = require("../models/Post");
const User = require("../models/User");
const { isValidUrl } = require("../utils/validators");
const createNotification = require("../utils/createNotification");
const { getPagination } = require("../utils/paginateQuery");

const postPopulate = [
  { path: "user", select: "username name profilePicture" },
  { path: "comments.user", select: "username name profilePicture" }
];

const findPopulatedPostById = (id) => Post.findById(id).populate(postPopulate);

const getPosts = async (req, res) => {
  try {
    const { query = "", scope = "all" } = req.query;
    const search = query.trim();
    const mongoQuery = {};
    const { page, limit, skip } = getPagination(req.query);

    if (search) {
      const matchingUsers = await User.find({
        $or: [{ username: new RegExp(search, "i") }, { name: new RegExp(search, "i") }]
      }).select("_id");

      mongoQuery.$or = [
        { text: new RegExp(search, "i") },
        { user: { $in: matchingUsers.map((user) => user._id) } }
      ];
    }

    if (scope === "following") {
      const currentUser = await User.findById(req.user._id).select("following");
      mongoQuery.user = { $in: [...currentUser.following, req.user._id] };
    }

    if (scope === "mine") {
      mongoQuery.user = req.user._id;
    }

    if (scope === "saved") {
      const currentUser = await User.findById(req.user._id).select("savedPosts");
      mongoQuery._id = { $in: currentUser.savedPosts };
    }

    const [posts, total] = await Promise.all([
      Post.find(mongoQuery).populate(postPopulate).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(mongoQuery)
    ]);

    return res.status(200).json({
      items: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
};

const createPost = async (req, res) => {
  try {
    const { text, imageUrl = "" } = req.body;
    const trimmedText = text?.trim() || "";
    const trimmedImageUrl = imageUrl.trim();

    if (!trimmedText && !trimmedImageUrl) {
      return res.status(400).json({ message: "Add text or an image to create a post" });
    }

    if (trimmedText.length > 500) {
      return res.status(400).json({ message: "Post text must be 500 characters or fewer" });
    }

    if (!isValidUrl(trimmedImageUrl)) {
      return res.status(400).json({ message: "Please provide a valid image URL" });
    }

    const post = await Post.create({
      user: req.user._id,
      text: trimmedText,
      imageUrl: trimmedImageUrl
    });

    const populatedPost = await findPopulatedPostById(post._id);

    return res.status(201).json(populatedPost);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create post" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { text = "", imageUrl = "" } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    const trimmedText = text.trim();
    const trimmedImageUrl = imageUrl.trim();

    if (!trimmedText && !trimmedImageUrl) {
      return res.status(400).json({ message: "A post must include text or an image" });
    }

    if (!isValidUrl(trimmedImageUrl)) {
      return res.status(400).json({ message: "Please provide a valid image URL" });
    }

    post.text = trimmedText;
    post.imageUrl = trimmedImageUrl;
    post.editedAt = new Date();
    await post.save();

    return res.status(200).json(await findPopulatedPostById(post._id));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete post" });
  }
};

const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hasLiked = post.likes.some((like) => like.toString() === req.user._id.toString());

    if (hasLiked) {
      post.likes = post.likes.filter((like) => like.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    if (!hasLiked) {
      await createNotification({
        recipient: post.user,
        sender: req.user._id,
        type: "like",
        post: post._id,
        text: "liked your post"
      });
    }

    return res.status(200).json({
      message: hasLiked ? "Post unliked" : "Post liked",
      post: await findPopulatedPostById(post._id)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update post like" });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const trimmedText = text?.trim() || "";

    if (!trimmedText) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      text: trimmedText
    });

    await post.save();

    await createNotification({
      recipient: post.user,
      sender: req.user._id,
      type: "comment",
      post: post._id,
      text: "commented on your post"
    });

    return res.status(201).json({
      message: "Comment added",
      post: await findPopulatedPostById(post._id)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add comment" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isCommentOwner = comment.user.toString() === req.user._id.toString();
    const isPostOwner = post.user.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ message: "You cannot delete this comment" });
    }

    comment.deleteOne();
    await post.save();

    return res.status(200).json({
      message: "Comment deleted",
      post: await findPopulatedPostById(post._id)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete comment" });
  }
};

const toggleSavePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(req.user._id);
    const hasSaved = user.savedPosts.some((savedPostId) => savedPostId.toString() === post._id.toString());

    if (hasSaved) {
      user.savedPosts = user.savedPosts.filter(
        (savedPostId) => savedPostId.toString() !== post._id.toString()
      );
    } else {
      user.savedPosts.push(post._id);
    }

    await user.save();

    return res.status(200).json({
      message: hasSaved ? "Post removed from saved items" : "Post saved",
      savedPosts: user.savedPosts
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update saved posts" });
  }
};

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment,
  deleteComment,
  toggleSavePost
};
