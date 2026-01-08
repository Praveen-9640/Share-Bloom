import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { Heart, Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
// 1. Import EmailJS
import emailjs from '@emailjs/browser';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  // Generate CAPTCHA
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  useEffect(() => {
    generateCaptcha();
    if (location.state?.role) {
      setValue("role", location.state.role);
    }
  }, [location.state, setValue]);

  const onSubmit = async (data) => {
    // 1. CAPTCHA Check
    if (data.captchaInput.toUpperCase() !== captchaCode) {
      setError('captchaInput', { type: 'manual', message: 'Incorrect CAPTCHA code' });
      toast.error('Incorrect CAPTCHA. Please try again.');
      generateCaptcha();
      return;
    }
    clearErrors('captchaInput');

    setLoading(true);
    try {
      // 2. Register User
      const result = await registerUser(data);

      if (result.success) {
        
        // 3. SEND WELCOME EMAIL
        // Your Credentials
        const serviceId = "service_bbhj1lp";
        const publicKey = "3RRsech-FZUtRutBZ";
        const templateId = "template_welcome"; // Ensure this ID exists in your EmailJS dashboard

        const templateParams = {
          to_name: data.name,
          to_email: data.email,
          role: data.role,
          message: "Welcome to ShareBloom! We are excited to have you join our mission.",
        };

        // Send Email (Async - don't await so we don't block redirect)
        emailjs.send(serviceId, templateId, templateParams, publicKey)
          .then((response) => {
            console.log("Welcome email sent!", response.status, response.text);
          })
          .catch((error) => {
            console.error("Failed to send welcome email:", error);
          });

        toast.success("Registration successful!");

        // 4. Redirect
        if (data.role === "admin") navigate("/admin");
        else navigate("/dashboard");

      } else {
        toast.error(result.message);
        generateCaptcha();
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during registration");
      generateCaptcha();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-rose-100 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-rose-400 fill-current" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-slate-800 tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Or{" "}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-500 transition-colors">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-sm rounded-[2rem] border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                {...register("name", { required: true })}
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-rose-400">Name is required</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                {...register("email", { required: true })}
                type="email"
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                placeholder="name@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-rose-400">Email is required</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input
                {...register("phone", { required: true })}
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                placeholder="+1 (555) 000-0000"
              />
              {errors.phone && <p className="mt-1 text-sm text-rose-400">Phone is required</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Select Role</label>
              <div className="relative">
                <select
                  {...register("role", { required: true })}
                  className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all appearance-none"
                >
                  <option value="">Select your role...</option>
                  <option value="donor">Donate Items</option>
                  <option value="recipient">Request Items</option>
                  <option value="logistics">Logistics Helper</option>
                  <option value="admin">Administrator</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
              {errors.role && <p className="mt-1 text-sm text-rose-400">Role is required</p>}
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Organization (Optional)</label>
              <input
                {...register("organization")}
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                placeholder="Company or NGO name"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative mt-1">
                <input
                  {...register("password", { required: true })}
                  type={showPassword ? "text" : "password"}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                {...register("confirmPassword", {
                  required: true,
                  validate: (v) => v === password || "Passwords must match",
                })}
                type="password"
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-rose-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Custom CAPTCHA Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Security Check</label>
              <div className="flex gap-3 mb-2">
                <div className="flex-1 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-2xl font-bold font-mono tracking-widest text-slate-600 select-none relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/noise.png')]"></div>
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-500 transition-colors"
                  title="Refresh Code"
                >
                  <RefreshCw className="h-6 w-6" />
                </button>
              </div>
              <input
                {...register('captchaInput', { required: 'Please enter the code' })}
                type="text"
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all outline-none"
                placeholder="Enter the code above"
                autoComplete="off"
              />
              {errors.captchaInput && <p className="mt-1 text-sm text-rose-400">{errors.captchaInput.message}</p>}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-400 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed items-center"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;