import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [summary, setSummary] = useState({ unreadNotifications: 0, unreadMessages: 0 });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await axiosInstance.get("/notifications/summary");
        setSummary(data);
      } catch (error) {
        setSummary({ unreadNotifications: 0, unreadMessages: 0 });
      }
    };

    fetchSummary();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-soft">
            EM
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">EchoMateLite</p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Social Lite</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            Feed
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            My Profile
          </NavLink>
          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            Inbox{summary.unreadMessages ? ` (${summary.unreadMessages})` : ""}
          </NavLink>
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            Alerts{summary.unreadNotifications ? ` (${summary.unreadNotifications})` : ""}
          </NavLink>
          <Link
            to={`/u/${user?.username}`}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Public View
          </Link>
          <div className="ml-auto flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-2 py-2 sm:ml-0">
            <img
              src={
                user?.profilePicture ||
                "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
              }
              alt={user?.username || "Member"}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="hidden pr-2 sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name?.trim() || user?.username || "Member"}
              </p>
              <p className="text-xs text-slate-500">@{user?.username || "member"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
