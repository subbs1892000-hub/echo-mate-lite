import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const { data } = await axiosInstance.post("/auth/login", formData);
      login(data.token, data.user);
      showToast("Welcome back. You are signed in.", "success");
      navigate("/dashboard");
    } catch (err) {
      setErrors({
        form: err.response?.data?.message || "Unable to login. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[linear-gradient(135deg,#0f172a_0%,#111827_40%,#eff6ff_40%,#f8fafc_100%)] px-4 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden flex-col justify-between px-8 py-8 text-white lg:flex">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200">
            EchoMateLite
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-tight">
            A lighter, sharper way to share what matters.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
            Publish quick updates, explore people in your circle, and keep your profile fresh with
            a more thoughtful social experience.
          </p>
        </div>
        <div className="grid max-w-lg grid-cols-3 gap-4">
          {["Posts", "Profiles", "Comments"].map((item) => (
            <div key={item} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ready</p>
              <p className="mt-3 text-xl font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-white/50 bg-white/90 p-8 shadow-soft backdrop-blur">
          <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to continue using EchoMateLite.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
                placeholder="you@example.com"
                required
              />
              {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
                placeholder="Enter your password"
                required
              />
              {errors.password ? (
                <p className="mt-2 text-sm text-rose-600">{errors.password}</p>
              ) : null}
            </div>

            {errors.form ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {errors.form}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-brand-600">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
