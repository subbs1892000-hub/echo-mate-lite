import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import EmptyState from "../components/EmptyState";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import SkeletonCard from "../components/SkeletonCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    bio: "",
    profilePicture: ""
  });
  const [myPosts, setMyPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const profilePreview = useMemo(
    () => ({
      displayName: formData.name.trim() || formData.username || "Your Name",
      bio:
        formData.bio.trim() ||
        "Add a short bio so people know what you care about and what you share here.",
      avatar:
        formData.profilePicture ||
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80"
    }),
    [formData]
  );

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const [{ data: profile }, { data: posts }] = await Promise.all([
        axiosInstance.get("/profile"),
        axiosInstance.get("/posts", { params: { scope: "mine" } })
      ]);

      setFormData({
        username: profile.username || "",
        email: profile.email || "",
        name: profile.name || "",
        bio: profile.bio || "",
        profilePicture: profile.profilePicture || ""
      });
      setMyPosts(posts.items || []);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to load profile.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: formData.name,
        bio: formData.bio,
        profilePicture: formData.profilePicture
      };

      const { data } = await axiosInstance.put("/profile", payload);
      setFormData((prev) => ({
        ...prev,
        name: data.user.name || "",
        bio: data.user.bio || "",
        profilePicture: data.user.profilePicture || ""
      }));
      updateUser(data.user);
      showToast(data.message, "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const replacePostInState = (updatedPost) => {
    setMyPosts((prev) => prev.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
  };

  const removePostFromState = (postId) => {
    setMyPosts((prev) => prev.filter((post) => post._id !== postId));
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <SkeletonCard />
            <div className="space-y-5">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="space-y-6">
              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
                <div className="h-28 bg-[linear-gradient(120deg,#0f172a,#1d4ed8,#38bdf8)]" />
                <div className="px-6 pb-6">
                  <img
                    src={profilePreview.avatar}
                    alt={profilePreview.displayName}
                    className="-mt-12 h-24 w-24 rounded-[1.4rem] border-4 border-white object-cover shadow-soft"
                  />
                  <h1 className="mt-4 text-2xl font-bold text-slate-900">
                    {profilePreview.displayName}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">@{formData.username}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{profilePreview.bio}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[1.2rem] bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Posts</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{myPosts.length}</p>
                    </div>
                    <div className="rounded-[1.2rem] bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                        Preview
                      </p>
                      <Link
                        to={`/u/${formData.username}`}
                        className="mt-2 inline-block text-sm font-semibold text-brand-600"
                      >
                        Open public view
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </aside>

            <section className="space-y-6">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Profile settings
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-900">Refine how people see you</h2>
                  </div>
                  <p className="text-sm text-slate-500">{formData.bio.length}/200 bio characters</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      disabled
                      className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Display name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
                      placeholder="Your display name"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Profile picture URL
                    </label>
                    <input
                      type="url"
                      name="profilePicture"
                      value={formData.profilePicture}
                      onChange={handleChange}
                      className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
                      placeholder="https://example.com/profile.jpg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="min-h-36 w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
                      placeholder="Tell the community what you build, enjoy, or post about."
                      maxLength={200}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-[1.2rem] bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Archive
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">Your recent posts</h3>
                  </div>
                </div>

                {myPosts.length ? (
                  myPosts.map((post) => (
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
                ) : (
                  <EmptyState
                    title="You have not posted yet"
                    description="Head back to the dashboard and share your first update. It will appear here as part of your personal archive."
                  />
                )}
              </section>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
