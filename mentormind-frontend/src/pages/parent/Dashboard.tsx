import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FiUser, FiChevronRight } from 'react-icons/fi';

interface ChildSummary {
  id: number;
  name: string;
  email: string;
}

const ChildSummaryCard: React.FC<{ child: ChildSummary }> = ({ child }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 flex justify-between items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-1">{child.name}</h3>
      <p className="text-gray-600">{child.email}</p>
    </div>
    <Link
      to={`/parent/reports?student_email=${child.email}`}
      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
    >
      View Report <FiChevronRight className="ml-2" />
    </Link>
  </div>
);

const ParentDashboard: React.FC = () => {
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        const response = await axiosClient.get('/parents/children');
        setChildren(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to fetch linked children.');
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-600 text-xl">Loading Dashboard...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Parent Dashboard</h1>
      
      {children.length > 0 ? (
        <div className="space-y-6">
          {children.map((child) => (
            <ChildSummaryCard key={child.id} child={child} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-lg mx-auto">
          <FiUser size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Children Linked</h2>
          <p className="text-lg text-gray-600 mb-6">To see student reports, you first need to link a child to your account.</p>
          <Link
            to="/parent/link-child"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Link a Child Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
