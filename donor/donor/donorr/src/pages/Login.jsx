import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Eye, EyeOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm();

  // Generate a random 6-character string
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars like I, 1, 0, O
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const onSubmit = async (data) => {
    // CAPTCHA Validation
    if (data.captchaInput.toUpperCase() !== captchaCode) {
      setError('captchaInput', { type: 'manual', message: 'Incorrect CAPTCHA code' });
      toast.error('Incorrect CAPTCHA. Please try again.');
      generateCaptcha(); // Refresh on failure
      return;
    }
    clearErrors('captchaInput');

    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success('Login successful!');
        const role = result.user?.role;
        if (role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      } else {
        toast.error(result.message);
        generateCaptcha(); // Refresh on login failure too
      }
    } catch (error) {
      toast.error('An error occurred during login');
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-rose-100 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-rose-400 fill-current" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-slate-800 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Or{' '}
          <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-500 transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-sm rounded-3xl border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all outline-none"
                placeholder="name@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all outline-none pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
            </div>

            {/* Custom CAPTCHA Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Security Check</label>
              <div className="flex gap-3 mb-2">
                <div className="flex-1 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-2xl font-bold font-mono tracking-widest text-slate-600 select-none relative overflow-hidden">
                  {/* Noise overlay for visual effect */}
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

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-slate-600">
                <input type="checkbox" className="mr-2 h-4 w-4 rounded border-slate-300 text-indigo-400 focus:ring-indigo-200" />
                Remember me
              </label>

              <a href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-400 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200 transition-all duration-300"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;