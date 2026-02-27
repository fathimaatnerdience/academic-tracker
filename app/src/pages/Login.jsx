import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { handleError } from '../utils/errorHandler';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      handleError(error, 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8" style={{ backgroundColor: '#DDDB59' }}>
      
      {/* WHITE CARD WRAPPER */}
      <div className="w-full max-w-[1400px] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col sm:flex-row">

        {/* ── LEFT PANEL (Yellow inside white card) - Always Visible ── */}
        <div
          className="w-full sm:w-[45%] md:w-[48%] lg:w-[45%] flex flex-col items-center rounded-xl sm:rounded-xl  justify-center p-4 sm:p-6 md:p-12 lg:p-20 m-2 sm:m-3 md:m-4"
          style={{ backgroundColor: '#DDDB59' }}
        >
          {/* Logo / Brand */}
          <div className="mb-4 sm:mb-6 md:mb-10 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-full bg-white flex items-center justify-center shadow-lg">

              <img src="/ac.logo.png" alt="Academic Tracker Logo" className="w-20 h-20 rounded-full mx-auto mb-0 scale-110" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow">
              Academic
            </h1>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow">
              Tracker
            </h1>
            <p className="mt-1 sm:mt-2 md:mt-3 text-white/80 text-xs sm:text-sm md:text-base lg:text-lg font-medium">
              School Management System
            </p>
          </div>

          {/* Decorative illustration blocks */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4 w-full max-w-xs">
            {[
              { icon: '🎓', label: 'Connect Students & Teachers' },
              { icon: '📚', label: 'Track Classes & Subjects' },
              { icon: '📊', label: 'Monitor Results & Attendance' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 sm:gap-3 md:gap-4 bg-white/20 backdrop-blur rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3"
              >
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl">{item.icon}</span>
                <span className="text-white font-semibold text-xs sm:text-sm md:text-base">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL (White form area) ── */}
        <div className="flex-1 bg-white flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-md">

            {/* Header */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">WELCOME BACK!</h2>
              <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
                Enter your email and password to access your account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  style={{ '--tw-ring-color': '#DDDB59' }}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 3px #DDDB5966'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none transition pr-10 sm:pr-12"
                    onFocus={e => e.target.style.boxShadow = '0 0 0 3px #DDDB5966'}
                    onBlur={e => e.target.style.boxShadow = 'none'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition text-sm sm:text-base"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Forgot Password 
              <div className="flex justify-end">
                <button type="button" className="text-xs sm:text-sm font-medium" style={{ color: '#1976D2' }}>
                  Forgot Password?
                </button>
              </div>*/}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 sm:py-2.5 md:py-3 text-sm sm:text-base rounded-lg text-gray-900 font-bold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                style={{ backgroundColor: '#DDDB59' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>

            </form>

            {/* Divider */}
            <div className="my-4 sm:my-5 md:my-6 flex items-center gap-3 sm:gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs sm:text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 text-xs sm:text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold hover:underline"
                style={{ color: '#1976D2' }}
              >
                Sign Up
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
