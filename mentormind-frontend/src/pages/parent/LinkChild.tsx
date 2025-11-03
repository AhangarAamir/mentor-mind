import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const LinkChild: React.FC = () => {
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosClient.post('/parents/link', { student_email: studentEmail });
      toast.success(response.data.message || 'Child linked successfully!');
      setStudentEmail('');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to link child.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Link Your Child</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentEmail">
              Child's Email
            </label>
            <input
              type="email"
              id="studentEmail"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your child's email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Linking...' : 'Link Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkChild;
