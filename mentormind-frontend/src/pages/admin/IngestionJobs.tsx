import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface IngestionJob {
  id: number;
  filename: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  updated_at: string;
}

const IngestionJobs: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading, isError, error } = useQuery<IngestionJob[]>({
    queryKey: ['ingestionJobs'],
    queryFn: async () => {
      const response = await axiosClient.get('/ingest/status');
      return response.data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds to update status
  });

  const startIngestionMutation = useMutation({
    mutationFn: async (jobId: number) => {
      await axiosClient.post(`/ingest/start/${jobId}`);
    },
    onSuccess: () => {
      toast.success('Ingestion job started successfully!');
      queryClient.invalidateQueries({ queryKey: ['ingestionJobs'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to start ingestion job.');
    },
  });

  if (isLoading) return <div className="p-4">Loading ingestion jobs...</div>;
  if (isError) return <div className="p-4 text-red-500">Error: {error?.message || 'Failed to fetch jobs'}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ingestion Jobs</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {jobs && jobs.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filename
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.filename}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(job.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {job.status === 'PENDING' && (
                      <button
                        onClick={() => startIngestionMutation.mutate(job.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        disabled={startIngestionMutation.isPending}
                      >
                        {startIngestionMutation.isPending ? 'Starting...' : 'Start Ingestion'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No ingestion jobs found.</p>
        )}
      </div>
    </div>
  );
};

export default IngestionJobs;
