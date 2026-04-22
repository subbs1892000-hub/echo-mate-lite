const Story = require("../models/Story");
const { isValidUrl } = require("../utils/validators");
const { getPagination } = require("../utils/paginateQuery");

const storyPopulate = { path: "user", select: "username name profilePicture" };

const getStories = async (req, res) => {
  try {
    const now = new Date();
    const { page, limit, skip } = getPagination(req.query);
    const stories = await Story.find({ expiresAt: { $gt: now } })
      .populate(storyPopulate)
      .sort({ createdAt: -1 });

    const groupedStories = stories.reduce((accumulator, story) => {
      const userId = story.user._id.toString();

      if (!accumulator[userId]) {
        accumulator[userId] = {
          user: story.user,
          stories: [],
          hasUnseen: false
        };
      }

      accumulator[userId].stories.push(story);
      if (!story.viewers.some((viewer) => viewer.toString() === req.user._id.toString())) {
        accumulator[userId].hasUnseen = true;
      }

      return accumulator;
    }, {});

    const groupedValues = Object.values(groupedStories);
    const paginatedGroups = groupedValues.slice(skip, skip + limit);

    return res.status(200).json({
      items: paginatedGroups,
      pagination: {
        page,
        limit,
        total: groupedValues.length,
        totalPages: Math.ceil(groupedValues.length / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch stories" });
  }
};

const createStory = async (req, res) => {
  try {
    const { imageUrl = "", text = "" } = req.body;
    const trimmedText = text.trim();
    const trimmedImageUrl = imageUrl.trim();

    if (!trimmedText && !trimmedImageUrl) {
      return res.status(400).json({ message: "Add text or an image to create a story" });
    }

    if (!isValidUrl(trimmedImageUrl)) {
      return res.status(400).json({ message: "Please provide a valid story image URL" });
    }

    const story = await Story.create({
      user: req.user._id,
      imageUrl: trimmedImageUrl,
      text: trimmedText,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    return res.status(201).json(await Story.findById(story._id).populate(storyPopulate));
  } catch (error) {
    return res.status(500).json({ message: "Failed to create story" });
  }
};

const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story || story.expiresAt <= new Date()) {
      return res.status(404).json({ message: "Story not found" });
    }

    const hasViewed = story.viewers.some((viewer) => viewer.toString() === req.user._id.toString());
    if (!hasViewed) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    return res.status(200).json({ message: "Story marked as viewed" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark story as viewed" });
  }
};

const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own story" });
    }

    await story.deleteOne();
    return res.status(200).json({ message: "Story deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete story" });
  }
};

module.exports = { getStories, createStory, viewStory, deleteStory };
