import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface StudentProfileData {
  name: string;
  email: string;
  grade: number;
  syllabus: string;
}

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentProfileData>({
    name: '',
    email: '',
    grade: 0,
    syllabus: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await axiosClient.get(`/users/me`); // Assuming /users/me returns full user profile
        setProfile(response.data);
        setFormData(response.data);
        toast.success('Profile loaded successfully!');
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming there's an endpoint to update user profile
      await axiosClient.put(`/users/${user?.id}`, formData);
      setProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-6 text-red-500 text-center">Error: Could not load profile.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Student Profile</h1>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="grade">
                Grade
              </label>
              <input
                type="number"
                id="grade"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                value={formData.grade}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="syllabus">
                Syllabus
              </label>
              <input
                type="text"
                id="syllabus"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                value={formData.syllabus}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setFormData(profile); }} // Revert changes on cancel
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-lg">
              <span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-900">{profile.name}</span>
            </p>
            <p className="text-lg">
              <span className="font-semibold text-gray-700">Email:</span> <span className="text-gray-900">{profile.email}</span>
            </p>
            <p className="text-lg">
              <span className="font-semibold text-gray-700">Grade:</span> <span className="text-gray-900">{profile.grade}</span>
            </p>
            <p className="text-lg">
              <span className="font-semibold text-gray-700">Syllabus:</span> <span className="text-gray-900">{profile.syllabus}</span>
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
