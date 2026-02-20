/**
 * ForgotPasswordPage - Password reset request
 * Simple page to request password reset link
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Loader2, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

/**
 * ForgotPasswordPage Component
 * Provides password reset functionality
 */
const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Validate email input
   */
  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  /**
   * Handle password reset request
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Reset password card */}
      <div className="relative w-full max-w-md">
        {/* Back button */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Reset Password</h1>
              <p className="text-center text-gray-600 mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Reset form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        error ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              {/* Help text */}
              <p className="text-center text-gray-600 text-sm mt-6">
                Check your email for a link to reset your password. The link will expire in 1 hour.
              </p>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="flex justify-center mb-8">
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">Check Your Email</h1>
              <p className="text-center text-gray-600 mb-8">
                We've sent a password reset link to <span className="font-semibold">{email}</span>.
                Check your email and follow the instructions to reset your password.
              </p>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-blue-900 text-sm">
                  <strong>Didn't receive an email?</strong> Check your spam folder or try resetting with a different email address.
                </p>
              </div>

              {/* Back to login button */}
              <Link
                to="/login"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center"
              >
                Back to Login
              </Link>

              {/* Try again button */}
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                  setError('');
                }}
                className="w-full mt-3 text-indigo-600 font-semibold py-2.5 rounded-lg hover:text-indigo-700 transition"
              >
                Try Another Email
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
