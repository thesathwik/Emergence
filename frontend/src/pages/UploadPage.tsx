import React from 'react';
import { Navigate } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const UploadPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" color="blue" text="Loading..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload New Agent</h1>
        <p className="text-gray-600">Share your AI agent with the community</p>
      </div>
      
      <UploadForm />
    </div>
  );
};

export default UploadPage;
