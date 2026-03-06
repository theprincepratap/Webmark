import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.forgotPassword(email);
      setEmailSent(true);
      
      // If using Ethereal test mode, show preview URL
      if (response.data?.previewUrl) {
        setPreviewUrl(response.data.previewUrl);
        toast.success('Email sent! Check the preview link below.');
      } else {
        toast.success('Check your email for reset instructions');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset email';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Check your email
          </h1>
          
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            If an account exists for <span className="font-medium text-gray-900 dark:text-white">{email}</span>, 
            you'll receive a password reset link shortly.
          </p>

          {/* Ethereal Preview URL (Development Mode) */}
          {previewUrl && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
                🧪 Test Mode - Preview Email:
              </p>
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {previewUrl}
              </a>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => setEmailSent(false)}
              className="btn btn-secondary w-full"
            >
              Try another email
            </button>
            
            <Link to="/login" className="btn btn-ghost w-full">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <Bookmark className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            Webmark
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forgot password?
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="you@example.com"
                className={`input pl-11 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoComplete="email"
                autoFocus
              />
            </div>
            {error && (
              <p className="mt-1.5 text-sm text-red-500">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send reset link</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
