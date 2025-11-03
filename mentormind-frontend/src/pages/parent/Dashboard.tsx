import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ChildSummary {
  id: number;
  name: string;
  email: string;
  average_score: number;
  lessons_completed: number;
}

const ChildSummaryCard: React.FC<{ child: ChildSummary }> = ({ child }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 transform transition-all duration-300 hover:scale-105">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{child.name}</h3>
    <p className="text-gray-600 mb-4">{child.email}</p>
    <div className="flex justify-between items-center text-gray-700 text-sm mb-2">
      <span>Average Score:</span>
      <span className="font-bold text-blue-600">{child.average_score}%</span>
    </div>
    <div className="flex justify-between items-center text-gray-700 text-sm mb-4">
      <span>Lessons Completed:</span>
      <span className="font-bold text-green-600">{child.lessons_completed}</span>
    </div>
    <Link
      to={`/parent/reports?studentId=${child.id}`}
      className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
    >
      View Full Report
    </Link>
  </div>
);

const ParentDashboard: React.FC = () => {
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        // Assuming an API endpoint to get a list of linked children for the parent
        const response = await axiosClient.get('/parents/children'); // This endpoint needs to be implemented in backend
        setChildren(response.data);
        toast.success('Children data loaded!');
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to fetch children data.');
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Parent Dashboard</h1>
      
      {children.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <ChildSummaryCard key={child.id} child={child} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <p className="text-lg text-gray-700 mb-6">You haven't linked any children yet.</p>
          <Link
            to="/parent/link-child"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Link a Child
          </Link>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
