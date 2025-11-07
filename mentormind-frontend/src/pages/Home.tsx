import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiArrowRight } from 'react-icons/fi';

const Home: React.FC = () => {
  const { user, loading } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'parent':
        return '/parent/dashboard';
      case 'admin':
        return '/admin/upload';
      default:
        return '/login';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8 text-center">
      {user ? (
        <>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Welcome back, <span className="text-yellow-300">{user.name}!</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mb-10">
            Ready to continue your learning journey? Let's dive back in.
          </p>
          <Link
            to={getDashboardLink()}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 text-lg"
          >
            Go to Your Dashboard
            <FiArrowRight className="ml-3" size={22} />
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Welcome to <span className="block text-yellow-300">MentorMind</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mb-10">
            Your AI-powered tutoring system for personalized learning, progress tracking, and quiz mastery.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className="px-8 py-3 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 border-2 border-white text-white font-bold rounded-full shadow-lg hover:bg-white hover:text-blue-600 transition duration-300 transform hover:scale-105"
            >
              Login
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
