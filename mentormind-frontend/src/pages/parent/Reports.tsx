import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { FiBarChart2, FiCheckCircle, FiTrendingDown, FiZap } from 'react-icons/fi';

interface StudentReportData {
  student_name: string;
  quiz_attempts: number;
  average_score: number;
  weak_topics: string[];
  lessons_completed: number;
  learning_streak_days: number;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
    <div className={`rounded-full p-3 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const ParentReports: React.FC = () => {
  const [studentEmail, setStudentEmail] = useState('');
  const [report, setReport] = useState<StudentReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!studentEmail) {
      toast.error('Please enter a student email address.');
      return;
    }
    setLoading(true);
    setReport(null);
    try {
      const response = await axiosClient.get('/parents/report', {
        params: { student_email: studentEmail }
      });
      setReport(response.data);
      toast.success('Report fetched successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">View Student Performance</h1>
        <p className="text-gray-600 mb-6">Enter the email address of your linked student to see their latest report.</p>
        <form onSubmit={fetchReport}>
          <div className="mb-4">
            <input
              type="email"
              id="studentEmail"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              placeholder="e.g., student@example.com"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? 'Fetching Report...' : 'Fetch Report'}
          </button>
        </form>
      </div>

      {report && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Performance Report for <span className="text-blue-600">{report.student_name}</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<FiBarChart2 size={24} className="text-green-800" />} label="Average Score" value={`${report.average_score.toFixed(1)}%`} color="bg-green-100" />
            <StatCard icon={<FiCheckCircle size={24} className="text-blue-800" />} label="Quizzes Taken" value={report.quiz_attempts} color="bg-blue-100" />
            <StatCard icon={<FiZap size={24} className="text-yellow-800" />} label="Learning Streak" value={`${report.learning_streak_days} Days`} color="bg-yellow-100" />
            <StatCard icon={<FiTrendingDown size={24} className="text-purple-800" />} label="Lessons Done" value={report.lessons_completed} color="bg-purple-100" />
          </div>

          {report.weak_topics.length > 0 && (
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiTrendingDown className="mr-3 text-red-500" size={24} />
                Topics to Focus On
              </h3>
              <ul className="space-y-3">
                {report.weak_topics.map((topic, index) => (
                  <li key={index} className="bg-red-50 text-red-800 p-4 rounded-lg font-medium">
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentReports;
