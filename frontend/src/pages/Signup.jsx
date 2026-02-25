import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Eye, EyeOff } from "lucide-react";
import collegeImg from "../assets/college.png";

const Signup = () => {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) console.log("Signup form is valid");
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all";

  return (
    <section className="min-h-screen flex max-md:flex-col bg-gray-50">
      {/* Left image panel */}
      <div
        className="flex-1 min-w-[320px] max-md:h-[35vh] max-md:flex-none bg-cover bg-center bg-no-repeat relative"
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
            Create an account and start exploring instantly.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-[440px] max-md:w-full flex items-center justify-center p-6">
        <div className="w-full bg-white p-8 rounded-2xl shadow-lg shadow-violet-100/50 max-md:-mt-8 max-md:rounded-2xl border border-gray-100">
          <h3 className="mb-1 text-text-dark font-bold text-xl">Create account</h3>
          <p className="mb-6 text-gray-500 text-sm">Sign up to get started</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">Full Name</span>
              <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
              {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <div className="relative">
                <input type={show1 ? "text" : "password"} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-400 cursor-pointer hover:text-violet-600 transition-colors" onClick={() => setShow1((s) => !s)}>
                  {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">Confirm Password</span>
              <div className="relative">
                <input type={show2 ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-400 cursor-pointer hover:text-violet-600 transition-colors" onClick={() => setShow2((s) => !s)}>
                  {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword}</span>}
            </label>

            <button className="w-full py-3 bg-violet-600 text-white border-none rounded-xl font-semibold text-sm mt-1 hover:bg-violet-700 cursor-pointer transition-colors">
              Sign up
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-600 font-semibold no-underline hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Signup;
