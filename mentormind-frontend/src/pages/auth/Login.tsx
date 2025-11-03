import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', new URLSearchParams({
        username: email,
        password: password,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      login(response.data.access_token, response.data.refresh_token);
      toast.success('Logged in successfully!');
      navigate('/'); // Redirect to home or dashboard after login
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a1a2e] p-4">
      <div 
        className="w-full max-w-md p-10 rounded-2xl shadow-2xl animate-fadeInUp bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 border border-gray-700"
        style={{ backgroundColor: 'rgba(20, 20, 30, 0.7)' }}
      >
        <h2 className="text-4xl font-extrabold text-center text-white mb-3">Welcome Back!</h2>
        <p className="text-center text-gray-400 mb-8">Login to continue your learning journey.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaEnvelope className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              id="email"
              className="w-full pl-12 pr-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-500"
              placeholder="your@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <FaLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              id="password"
              className="w-full pl-12 pr-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            ) : (
              'Login'
            )}
          </button>
          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-purple-400 hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
