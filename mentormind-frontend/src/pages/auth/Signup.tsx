import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaUsers } from 'react-icons/fa';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'parent' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/auth/signup', {
        name,
        email,
        password,
        role,
      });
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a1a2e] p-4">
      <div
        className="w-full max-w-md p-10 rounded-2xl shadow-2xl animate-fadeInUp bg-gray-900/70 backdrop-filter backdrop-blur-lg border border-gray-700"
      >
        <h2 className="text-4xl font-extrabold text-center text-white mb-3">Create Your Account</h2>
        <p className="text-center text-gray-400 mb-8">Join MentorMind and start your personalized learning adventure.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="name"
              className="w-full pl-12 pr-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-500"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <div className="relative">
            <FaUsers className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
            <select
              id="role"
              className="w-full pl-12 pr-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg text-white appearance-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              value={role}
              onChange={(e) => setRole(e.target.value as 'student' | 'parent' | 'admin')}
            >
              <option value="student">I am a Student</option>
              <option value="parent">I am a Parent</option>
              <option value="admin">I am an Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            ) : (
              'Create Account'
            )}
          </button>
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-purple-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
