import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaHome, FaTachometerAlt, FaQuestionCircle, FaPencilAlt, FaUser, 
  FaUsers, FaLink, FaChartBar, FaFileUpload, FaCog, FaFileAlt, 
  FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';

interface SidebarLink {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<'student' | 'parent' | 'admin'>;
}

const sidebarLinks: SidebarLink[] = [
  { name: 'Home', path: '/', icon: FaHome, roles: ['student', 'parent', 'admin'] },
  { name: 'Dashboard', path: '/student/dashboard', icon: FaTachometerAlt, roles: ['student'] },
  { name: 'Ask Tutor', path: '/student/ask', icon: FaQuestionCircle, roles: ['student'] },
  { name: 'Quiz', path: '/student/quiz', icon: FaPencilAlt, roles: ['student'] },
  { name: 'Profile', path: '/student/profile', icon: FaUser, roles: ['student'] },
  { name: 'Dashboard', path: '/parent/dashboard', icon: FaUsers, roles: ['parent'] },
  { name: 'Link Child', path: '/parent/link-child', icon: FaLink, roles: ['parent'] },
  { name: 'Reports', path: '/parent/reports', icon: FaChartBar, roles: ['parent'] },
  { name: 'Upload PDF', path: '/admin/upload-pdf', icon: FaFileUpload, roles: ['admin'] },
  { name: 'Ingestion Jobs', path: '/admin/ingestion-jobs', icon: FaCog, roles: ['admin'] },
  { name: 'Reports', path: '/admin/reports', icon: FaFileAlt, roles: ['admin'] },
];

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const getFilteredLinks = () => {
    if (!user) return [];
    return sidebarLinks.filter(link => link.roles.includes(user.role));
  };

  return (
    <div 
      className={`relative flex-shrink-0 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-20 border border-gray-700 text-gray-200 ${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out h-[calc(100vh-2rem)] m-4 rounded-2xl shadow-2xl`}
      style={{ backgroundColor: 'rgba(20, 20, 30, 0.7)' }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {isOpen && <h2 className="text-xl font-bold text-purple-400 tracking-wider">MentorMind</h2>}
        <button onClick={toggleSidebar} className="text-gray-300 p-2 rounded-full bg-gray-800 hover:bg-purple-500 hover:text-white transition duration-300">
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {getFilteredLinks().map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center p-3 rounded-lg transition duration-200 text-base font-medium group relative ${
                isActive 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {isOpen && <span className="ml-4 transform transition-all duration-300">{link.name}</span>}
              {!isOpen && (
                <span className="absolute left-full ml-2 w-max bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {link.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
