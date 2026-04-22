import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import EmptyState from "../components/EmptyState";
import Navbar from "../components/Navbar";
import SkeletonCard from "../components/SkeletonCard";
import { useToast } from "../context/ToastContext";

const formatDate = (value) =>
  new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });

const NotificationsPage = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const [{ data }] = await Promise.all([
          axiosInstance.get("/notifications"),
          axiosInstance.post("/notifications/read")
        ]);
        setNotifications(data.items || []);
      } catch (error) {
        showToast(error.response?.data?.message || "Unable to load notifications.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Alerts</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-2 text-sm text-slate-500">
            Likes, comments, follows, and new messages show up here.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : notifications.length ? (
            notifications.map((notification) => {
              const targetLink =
                notification.type === "message"
                  ? `/messages/${notification.conversation?._id || ""}`
                  : notification.sender?.username
                    ? `/u/${notification.sender.username}`
                    : "/dashboard";

              return (
                <Link
                  key={notification._id}
                  to={targetLink}
                  className={`block rounded-[1.6rem] border p-5 shadow-soft transition hover:-translate-y-0.5 ${
                    notification.isRead ? "border-slate-200 bg-white" : "border-brand-200 bg-brand-50/40"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        notification.sender?.profilePicture ||
                        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={notification.sender?.username || "User"}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {notification.sender?.name?.trim() || notification.sender?.username || "Someone"}
                        </span>{" "}
                        {notification.text}
                      </p>
                      {notification.post?.text ? (
                        <p className="mt-2 truncate text-sm text-slate-500">
                          Post: {notification.post.text}
                        </p>
                      ) : null}
                      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <EmptyState
              title="No notifications yet"
              description="Once people interact with your posts, stories, follows, or messages, updates will appear here."
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default NotificationsPage;
