import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import EmptyState from "../components/EmptyState";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import PostComposer from "../components/PostComposer";
import SkeletonCard from "../components/SkeletonCard";
import StoriesBar from "../components/StoriesBar";
import StoryComposer from "../components/StoryComposer";
import StoryViewer from "../components/StoryViewer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import uploadImageIfNeeded from "../utils/uploadImage";

const feedTabs = [
  { id: "all", label: "For You" },
  { id: "following", label: "Following" },
  { id: "mine", label: "My Posts" },
  { id: "saved", label: "Saved" }
];

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [selectedScope, setSelectedScope] = useState("all");
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [storyGroups, setStoryGroups] = useState([]);
  const [activeStorySession, setActiveStorySession] = useState(null);
  const [isStorySubmitting, setIsStorySubmitting] = useState(false);

  const quickStats = useMemo(
    () => [
      { label: "Your handle", value: `@${user?.username || "member"}` },
      { label: "Display name", value: user?.name?.trim() || "Add one on your profile" },
      { label: "Posting mode", value: selectedScope === "mine" ? "Your archive" : "Community" }
    ],
    [selectedScope, user]
  );

  const fetchPosts = async () => {
    try {
      setIsFeedLoading(true);
      const { data } = await axiosInstance.get("/posts", {
        params: {
          scope: selectedScope,
          query: searchQuery.trim()
        }
      });
      setPosts(data.items || []);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to load posts right now.", "error");
    } finally {
      setIsFeedLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const { data } = await axiosInstance.get("/stories");
      setStoryGroups(data.items || []);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to load stories.", "error");
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setUserResults([]);
      return;
    }

    try {
      const { data } = await axiosInstance.get("/profile/search", {
        params: { query: searchQuery.trim() }
      });
      setUserResults(data);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to search users.", "error");
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStories();
  }, [selectedScope]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchPosts();
      searchUsers();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateStory = async ({ text, imageUrl }) => {
    try {
      setIsStorySubmitting(true);
      const finalImageUrl = await uploadImageIfNeeded(imageUrl, "echomatelite/stories");
      await axiosInstance.post("/stories", { text, imageUrl: finalImageUrl });
      await fetchStories();
      showToast("Story posted for the next 24 hours.", "success");
      return true;
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to create story.", "error");
      return false;
    } finally {
      setIsStorySubmitting(false);
    }
  };

  const handleStoryViewed = async (storyId) => {
    try {
      await axiosInstance.post(`/stories/${storyId}/view`);
      fetchStories();
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to mark story as viewed.", "error");
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      await axiosInstance.delete(`/stories/${storyId}`);
      await fetchStories();
      setActiveStorySession(null);
      showToast("Story deleted.", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to delete story.", "error");
    }
  };

  const handleOpenStoryGroup = (group) => {
    const groupIndex = storyGroups.findIndex((item) => item.user._id === group.user._id);
    setActiveStorySession({
      groupIndex,
      shouldChain: Boolean(group.hasUnseen)
    });
  };

  const handleStoryGroupComplete = async (currentGroup) => {
    if (!activeStorySession?.shouldChain) {
      return false;
    }

    const nextGroupIndex = storyGroups.findIndex(
      (group, index) => index > activeStorySession.groupIndex && group.hasUnseen
    );

    if (nextGroupIndex === -1) {
      return false;
    }

    setActiveStorySession({
      groupIndex: nextGroupIndex,
      shouldChain: true
    });
    return true;
  };

  const replacePostInState = (updatedPost) => {
    setPosts((prev) => prev.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
  };

  const removePostFromState = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const handleCreatePost = async ({ text, imageUrl }) => {
    try {
      setIsPosting(true);
      const finalImageUrl = await uploadImageIfNeeded(imageUrl, "echomatelite/posts");
      const { data } = await axiosInstance.post("/posts", { text, imageUrl: finalImageUrl });
      setPosts((prev) => [data, ...prev]);
      showToast("Post published.", "success");
      return true;
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to create post right now.", "error");
      return false;
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await axiosInstance.post(`/posts/${postId}/like`);
      replacePostInState(data.post);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to update like.", "error");
    }
  };

  const handleSave = async (postId) => {
    try {
      const { data } = await axiosInstance.post(`/posts/${postId}/save`);
      updateUser({
        ...user,
        savedPosts: data.savedPosts
      });
      showToast(data.message, "success");

      if (selectedScope === "saved") {
        fetchPosts();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to update saved posts.", "error");
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/posts/${postId}`);
      removePostFromState(postId);
      showToast("Post deleted.", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to delete post.", "error");
    }
  };

  const handleUpdate = async (postId, payload) => {
    try {
      const { data } = await axiosInstance.put(`/posts/${postId}`, payload);
      replacePostInState(data);
      showToast("Post updated.", "success");
      return true;
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to update post.", "error");
      return false;
    }
  };

  const handleAddComment = async (postId, text) => {
    try {
      const { data } = await axiosInstance.post(`/posts/${postId}/comments`, { text });
      replacePostInState(data.post);
      return true;
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to add comment.", "error");
      return false;
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const { data } = await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
      replacePostInState(data.post);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to delete comment.", "error");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 xl:grid-cols-[360px_minmax(0,1fr)_280px]">
        <aside className="space-y-6">
          <PostComposer onSubmit={handleCreatePost} isPosting={isPosting} />
          <StoryComposer onSubmit={handleCreateStory} isSubmitting={isStorySubmitting} />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Quick snapshot
            </p>
            <div className="mt-5 space-y-3">
              {quickStats.map((item) => (
                <div key={item.label} className="rounded-[1.3rem] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <StoriesBar
            stories={storyGroups}
            currentUser={user}
            onOpenGroup={handleOpenStoryGroup}
          />

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Explore
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Your social dashboard</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Search by people or post text, switch feed views, and keep the conversation moving.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchPosts}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Refresh Feed
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
                placeholder="Search posts, usernames, or display names"
              />

              <div className="flex flex-wrap gap-2">
                {feedTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedScope(tab.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedScope === tab.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isFeedLoading ? (
            <div className="space-y-5">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              title="No posts match this view"
              description="Try switching feed modes, searching for something broader, or posting the first update yourself."
            />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                onLike={handleLike}
                onSave={handleSave}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
            ))
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              People Search
            </p>
            <h3 className="mt-3 text-xl font-bold text-slate-900">Find creators and teammates</h3>

            <div className="mt-5 space-y-3">
              {userResults.length ? (
                userResults.map((person) => (
                  <Link
                    key={person._id}
                    to={`/u/${person.username}`}
                    className="flex items-center gap-3 rounded-[1.3rem] border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <img
                      src={
                        person.profilePicture ||
                        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={person.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {person.name?.trim() || person.username}
                      </p>
                      <p className="text-sm text-slate-500">@{person.username}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  Start typing in the search box to discover people and quickly jump to their public profiles.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Tips
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Use the upload control in the composer if you do not have a public image URL.</li>
              <li>Switch to `Following` to create a tighter, more personal feed.</li>
              <li>Visit your public profile to see how other users experience your content.</li>
            </ul>
          </section>
        </aside>
      </main>

      {activeStorySession && storyGroups[activeStorySession.groupIndex] ? (
        <StoryViewer
          group={storyGroups[activeStorySession.groupIndex]}
          currentUser={user}
          onClose={() => setActiveStorySession(null)}
          onViewed={handleStoryViewed}
          onDelete={handleDeleteStory}
          onGroupComplete={handleStoryGroupComplete}
        />
      ) : null}
    </div>
  );
};

export default DashboardPage;
