import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
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

    if (formData.username.trim().length < 3) {
      nextErrors.username = "Username must be at least 3 characters.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const { data } = await axiosInstance.post("/auth/signup", formData);
      login(data.token, data.user);
      showToast("Account created successfully.", "success");
      navigate("/dashboard");
    } catch (err) {
      setErrors({
        form: err.response?.data?.message || "Unable to create account. Please try again."
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
            Join The Circle
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-tight">
            Set up your profile and start posting in minutes.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
            EchoMateLite keeps the flow simple: authenticate, introduce yourself, and connect
            through polished lightweight interactions.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-white/50 bg-white/90 p-8 shadow-soft backdrop-blur">
          <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Join EchoMateLite and share your thoughts.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
                placeholder="echomate_user"
                required
              />
              {errors.username ? (
                <p className="mt-2 text-sm text-rose-600">{errors.username}</p>
              ) : null}
            </div>

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
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <span className="text-xs font-medium text-slate-400">
                  {formData.password.length}/6 min
                </span>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
                placeholder="At least 6 characters"
                minLength={6}
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
              {isLoading ? "Creating account..." : "Signup"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-600">
              Login
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default SignupPage;
