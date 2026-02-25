import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { MessageCircle, Eye, EyeOff } from "lucide-react";
import collegeImg from "../assets/college.png";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = "Username is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem("access_token", data.access_token);
      navigate("/admin");
    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed. Please try again.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex max-md:flex-col bg-gray-50">
      {/* Left image panel */}
      <div
        className="flex-1 min-w-[320px] max-md:h-[40vh] max-md:flex-none bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${collegeImg})` }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-violet-900/40" />
        <div className="absolute bottom-8 left-8 right-8 text-white z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MessageCircle size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">CollegeChat</span>
          </div>
          <p className="text-white/80 text-sm max-w-xs">
            Your smart digital assistant for instant college information.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-[440px] max-md:w-full flex items-center justify-center p-6">
        <div className="w-full bg-white p-8 rounded-2xl shadow-lg shadow-violet-100/50 max-md:-mt-8 max-md:rounded-2xl border border-gray-100">
          <h3 className="mb-1 text-text-dark font-bold text-xl">Welcome back</h3>
          <p className="mb-6 text-gray-500 text-sm">Log in to continue to your dashboard</p>

          {errors.general && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4 border border-red-100">{errors.general}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">Username</span>
              <input
                type="text"
                placeholder="Enter your username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all"
              />
              {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-400 cursor-pointer hover:text-violet-600 transition-colors"
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
            </label>

            <button
              disabled={loading}
              className="w-full py-3 bg-violet-600 text-white border-none rounded-xl font-semibold text-sm mt-1 hover:bg-violet-700 cursor-pointer disabled:opacity-60 transition-colors"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-violet-600 font-semibold no-underline hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
