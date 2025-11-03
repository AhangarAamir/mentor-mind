import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

interface StudentReportData {
  student_id: number;
  report_content: string;
}

const ParentReports: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [report, setReport] = useState<StudentReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!studentId) {
      toast.error('Please enter a student ID.');
      return;
    }
    setLoading(true);
    setReport(null);
    try {
      const response = await axiosClient.get(`/parents/report/${studentId}`);
      setReport(response.data);
      toast.success('Report fetched successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Student Reports</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
        <form onSubmit={fetchReport}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentId">
              Student ID
            </label>
            <input
              type="number"
              id="studentId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Fetching...' : 'Fetch Report'}
          </button>
        </form>
      </div>

      {report && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Report for Student ID: {report.student_id}</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: report.report_content }} />
        </div>
      )}
    </div>
  );
};

export default ParentReports;
