import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8">
      <h1 className="text-5xl md:text-7xl font-extrabold text-center mb-6 leading-tight">
        Welcome to <span className="block text-yellow-300">MentorMind</span>
      </h1>
      <p className="text-xl md:text-2xl text-center max-w-3xl mb-10">
        Your AI-powered tutoring system for personalized learning, progress tracking, and quiz mastery.
      </p>
      <div className="flex space-x-4">
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
    </div>
  );
};

export default Home;
