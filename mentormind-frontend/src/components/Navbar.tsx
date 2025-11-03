import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FaSignOutAlt } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <nav className="bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-30 border-b border-gray-700 text-white shadow-lg" style={{ backgroundColor: 'rgba(20, 20, 30, 0.7)' }}>
      <div className="container mx-auto flex justify-end items-center p-4">
        <div className="space-x-6 flex items-center">
          <span className="text-purple-300 text-lg font-semibold">
            Welcome, <span className="font-bold">{user?.name || user?.email}!</span>
          </span>
          <button 
            onClick={handleLogout} 
            className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition duration-300 shadow-md transform hover:scale-105"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
