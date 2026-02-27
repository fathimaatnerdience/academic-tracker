import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { handleError } from '../utils/errorHandler';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password, agreeTerms, role } = formData;

    if (!firstName || !lastName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        username: email.split('@')[0],
        email,
        password,
        role,
        name: `${firstName} ${lastName}`
      });

      if (response.success) {
        toast.success('Account created successfully! Please sign in.');
        navigate('/login');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      handleError(error, 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputFocus = (e) => {
    e.target.style.boxShadow = '0 0 0 3px #DDDB5966';
    e.target.style.borderColor = '#DDDB59';
  };
  const inputBlur = (e) => {
    e.target.style.boxShadow = 'none';
    e.target.style.borderColor = '#D1D5DB';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8" style={{ backgroundColor: '#DDDB59' }}>
      
      {/* WHITE CARD WRAPPER */}
      <div className="w-full max-w-[1400px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row">

        {/* ── LEFT PANEL (Yellow inside white card) - Always Visible ── */}
        <div
          className="w-full sm:w-[35%] md:w-[38%] lg:w-[45%] bg-[#DDDB59] flex flex-col items-center rounded-xl sm:rounded-xl  justify-center p-4 sm:p-6 md:p-12 lg:p-20 m-2 sm:m-3 md:m-4"
        >
          {/* Logo */}
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
              Join our school community
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4 w-full max-w-xs">
            {[
              { step: '01', label: 'Create your account' },
              { step: '02', label: 'Set up your profile' },
              { step: '03', label: 'Start tracking progress' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 sm:gap-3 md:gap-4 bg-white/20 backdrop-blur rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3"
              >
                <span className="text-white font-black text-sm sm:text-base md:text-lg w-6 sm:w-7 md:w-8">{item.step}</span>
                <span className="text-white font-semibold text-xs sm:text-sm md:text-base">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL (White form area) ── */}
        <div className="flex-1 bg-white flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="w-full max-w-md py-2 sm:py-4">

            {/* Header */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">CREATE AN ACCOUNT</h2>
              <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
                Fill in the details to get started
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">

              {/* First Name + Last Name */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none transition"
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none transition"
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@school.com"
                  disabled={loading}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none transition"
                  onFocus={inputFocus}
                  onBlur={inputBlur}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none transition"
                    onFocus={inputFocus}
                    onBlur={inputBlur}
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

              {/* Role Select */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 text-gray-900 focus:outline-none transition bg-white"
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 sm:gap-3">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-0.5 sm:mt-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded cursor-pointer"
                  style={{ accentColor: '#DDDB59' }}
                />
                <label htmlFor="agreeTerms" className="text-xs sm:text-sm text-gray-600 cursor-pointer">
                  I agree to the{' '}
                  <span className="font-semibold underline text-black hover:text-blue-600">
                    Terms & Conditions
                  </span>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-1.5 sm:py-2 text-sm sm:text-base rounded-lg text-gray-900 bg-[#DDDB59] font-bold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Sign Up'}
              </button>

            </form>

            {/* Divider */}
            <div className="my-4 sm:my-5 md:my-6 flex items-center gap-3 sm:gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs sm:text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Sign In Link */}
            <p className="text-center text-gray-600 text-xs sm:text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold hover:underline text-blue-700"
              >
                Sign In
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
