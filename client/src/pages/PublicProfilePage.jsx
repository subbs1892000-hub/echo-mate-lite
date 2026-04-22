import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import EmptyState from "../components/EmptyState";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import SkeletonCard from "../components/SkeletonCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const PublicProfilePage = () => {
  const { username } = useParams();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get(`/profile/${username}`);
      setProfileData(data);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to load profile.", "error");
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const updatePostInState = (updatedPost) => {
    setProfileData((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    }));
  };

  const removePostFromState = (postId) => {
    setProfileData((prev) => ({
      ...prev,
      posts: prev.posts.filter((post) => post._id !== postId),
      stats: {
        ...prev.stats,
        posts: Math.max((prev.stats?.posts || 1) - 1, 0)
      }
    }));
  };

  const handleFollowToggle = async () => {
    try {
      const { data } = await axiosInstance.post(`/profile/${username}/follow`);
      showToast(data.message, "success");
      fetchProfile();
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to update follow status.", "error");
    }
  };

  const handleMessageUser = async () => {
    navigate(`/messages?user=${username}`);
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await axiosInstance.post(`/posts/${postId}/like`);
      updatePostInState(data.post);
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
      updatePostInState(data);
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
      updatePostInState(data.post);
      return true;
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to add comment.", "error");
      return false;
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const { data } = await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
      updatePostInState(data.post);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to delete comment.", "error");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="space-y-5">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : !profileData ? (
          <EmptyState
            title="Profile not found"
            description="This user may have changed their username or no longer exists."
          />
        ) : (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
              <div className="h-32 bg-[linear-gradient(120deg,#0f172a,#1d4ed8,#38bdf8)]" />
              <div className="px-6 pb-6">
                <div className="-mt-14 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex items-end gap-4">
                    <img
                      src={
                        profileData.user.profilePicture ||
                        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80"
                      }
                      alt={profileData.user.username}
                      className="h-28 w-28 rounded-[1.7rem] border-4 border-white object-cover shadow-soft"
                    />
                    <div className="pb-2">
                      <h1 className="text-3xl font-bold text-slate-900">
                        {profileData.user.name || profileData.user.username}
                      </h1>
                      <p className="mt-1 text-sm text-slate-500">@{profileData.user.username}</p>
                    </div>
                  </div>

                  {!profileData.isOwnProfile ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleMessageUser}
                        className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        Message
                      </button>
                      <button
                        type="button"
                        onClick={handleFollowToggle}
                        className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                          profileData.isFollowing
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-brand-600 text-white hover:bg-brand-700"
                        }`}
                      >
                        {profileData.isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.4rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Posts</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{profileData.stats.posts}</p>
                  </div>
                  <div className="rounded-[1.4rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Followers</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {profileData.stats.followers}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Following</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {profileData.stats.following}
                    </p>
                  </div>
                </div>

                <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
                  {profileData.user.bio || "This user has not added a bio yet."}
                </p>
              </div>
            </section>

            {profileData.posts.length ? (
              <section className="space-y-5">
                {profileData.posts.map((post) => (
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
                ))}
              </section>
            ) : (
              <EmptyState
                title="No posts yet"
                description="Once this user shares something, their updates will appear here."
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicProfilePage;
