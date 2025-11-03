import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import Logout from '../pages/auth/Logout'; // Added Logout page

// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import AskTutor from '../pages/student/AskTutor';
import Quiz from '../pages/student/Quiz';
import StudentProfile from '../pages/student/Profile';

// Parent Pages
import ParentDashboard from '../pages/parent/Dashboard';
import LinkChild from '../pages/parent/LinkChild';
import ParentReports from '../pages/parent/Reports';

// Admin Pages
import UploadPDF from '../pages/admin/UploadPDF';
import IngestionJobs from '../pages/admin/IngestionJobs';
import AdminReports from '../pages/admin/Reports';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/logout" element={<Logout />} /> {/* Added Logout route */}

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/ask" element={<AskTutor />} />
        <Route path="/student/quiz" element={<Quiz />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Route>

      {/* Protected Parent Routes */}
      <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="/parent/link-child" element={<LinkChild />} />
        <Route path="/parent/reports" element={<ParentReports />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/upload-pdf" element={<UploadPDF />} />
        <Route path="/admin/ingestion-jobs" element={<IngestionJobs />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Route>

      {/* Catch-all for 404 - Optional */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
