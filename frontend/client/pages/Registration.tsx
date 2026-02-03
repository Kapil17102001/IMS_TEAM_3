import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Users,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  ChevronLeft,
  UserCircle
} from "lucide-react";

export default function Registration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "INTERN",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    setFormData(prev => ({ ...prev, role }));
    setStep(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/v1/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {step === 1 ? (
        // Step 1: Role Selection
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
              Join WIMS
            </h1>
            <p className="text-gray-400">Select your role to get started</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Intern Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect("INTERN")}
              className="bg-[#121212] border border-white/10 p-8 rounded-2xl hover:border-purple-500/50 transition-colors group cursor-pointer"
            >
              <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <User className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Intern</h2>
              <p className="text-gray-400 text-sm">
                Join to find opportunities, manage tasks, and grow your career.
              </p>
            </motion.div>

            {/* College Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect("COLLEGE")}
              className="bg-[#121212] border border-white/10 p-8 rounded-2xl hover:border-blue-500/50 transition-colors group cursor-pointer"
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <GraduationCap className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">College</h2>
              <p className="text-gray-400 text-sm">
                Register your institution to manage students and placements.
              </p>
            </motion.div>

            {/* Panel Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect("PANEL")}
              className="bg-[#121212] border border-white/10 p-8 rounded-2xl hover:border-emerald-500/50 transition-colors group cursor-pointer"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                <Users className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Panel</h2>
              <p className="text-gray-400 text-sm">
                Join as a panel member to conduct interviews and evaluations.
              </p>
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      ) : (
        // Step 2: Registration Form
        <div className="max-w-md w-full">
          <button
            onClick={() => setStep(1)}
            className="text-gray-500 hover:text-white flex items-center gap-2 mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Role Selection
          </button>

          <div className="bg-[#121212] border border-white/10 p-8 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                Sign Up as <span className="capitalize text-blue-400">{formData.role.toLowerCase()}</span>
              </h1>
              <p className="text-gray-400 text-sm">Create your account to continue</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Sign Up <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Sign In here
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}