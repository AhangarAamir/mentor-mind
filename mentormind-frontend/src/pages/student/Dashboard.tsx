import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import ProgressChart from '../../components/Charts/ProgressChart';
import ScoreTrendChart from '../../components/Charts/ScoreTrendChart';
import { useAuth } from '../../contexts/AuthContext';
import { FaBookOpen, FaPencilAlt, FaStar, FaFire } from 'react-icons/fa';

interface StudentDashboardData {
  lessons_completed: number;
  quiz_attempts: number;
  average_score: number;
  learning_streak_days: number;
  weak_topics: string[];
}

const DashboardCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
}> = ({ title, value, icon: Icon, color }) => (
  <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300">
    <div className="absolute -top-3 -right-3 opacity-10">
      <Icon className="text-7xl" style={{ color }} />
    </div>
    <div className="flex flex-col space-y-1">
      <h3 className="text-gray-600 font-semibold">{title}</h3>
      <p className="text-4xl font-extrabold text-gray-900">{value}</p>
    </div>
  </div>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await axiosClient.get('/students/dashboard');
        setDashboardData(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#fdf8f4]">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="p-6 text-red-500 text-center">Error loading dashboard data. Please try again later.</div>;
  }

  const progressChartData = [
    { name: 'Week 1', progress: 20 },
    { name: 'Week 2', progress: 40 },
    { name: 'Week 3', progress: 60 },
    { name: 'Week 4', progress: 80 },
  ];

  const scoreTrendChartData = [
    { name: 'Quiz 1', score: 75 },
    { name: 'Quiz 2', score: 80 },
    { name: 'Quiz 3', score: 85 },
    { name: 'Quiz 4', score: 90 },
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f4] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome, <span className="text-[#8B5CF6]">{user?.name}</span>
        </h1>
        <p className="text-gray-600 mb-10 text-lg">
          Here’s your progress overview — keep going strong!
        </p>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <DashboardCard title="Lessons Completed" value={dashboardData.lessons_completed} icon={FaBookOpen} color="#8B5CF6" />
          <DashboardCard title="Quiz Attempts" value={dashboardData.quiz_attempts} icon={FaPencilAlt} color="#10B981" />
          <DashboardCard title="Average Score" value={`${dashboardData.average_score}%`} icon={FaStar} color="#3B82F6" />
          <DashboardCard title="Learning Streak" value={`${dashboardData.learning_streak_days} days`} icon={FaFire} color="#F59E0B" />
        </div>

        {/* Charts and Weak Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-3">
            <ChartContainer title="Progress Over Time">
              <ProgressChart data={progressChartData} />
            </ChartContainer>
          </div>
          <div className="lg:col-span-2">
            <ChartContainer title="Weak Topics">
              {dashboardData.weak_topics.length > 0 ? (
                <ul className="space-y-3">
                  {dashboardData.weak_topics.map((topic, index) => (
                    <li key={index} className="flex items-center bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
                      <span className="font-bold mr-3">⚠️</span>
                      <span className="text-lg">{topic}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No weak topics identified — great job!</p>
              )}
            </ChartContainer>
          </div>
        </div>

        {/* Score Trend */}
        <ChartContainer title="Quiz Score Trend">
          <ScoreTrendChart data={scoreTrendChartData} />
        </ChartContainer>
      </div>
    </div>
  );
};

export default StudentDashboard;
