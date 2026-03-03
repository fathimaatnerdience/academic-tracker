import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { handleError } from '../utils/errorHandler';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!email) {
      toast.error('Please provide your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword({ email });
      if (response.success) {
        toast.success(response.message || 'If that email is registered, a reset link has been sent');
        navigate('/login');
      } else {
        toast.error(response.message || 'Request failed');
      }
    } catch (error) {
      handleError(error, 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#DDDB59' }}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Forgot Password</h2>
        <p className="text-gray-600 text-sm mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ '--tw-ring-color': '#DDDB59' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm rounded-lg text-gray-900 font-bold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            style={{ backgroundColor: '#DDDB59' }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs sm:text-sm mt-4">
          Remembered?{' '}
          <Link to="/login" className="font-bold hover:underline" style={{ color: '#1976D2' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
