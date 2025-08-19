import React from 'react';
import UploadForm from '../components/UploadForm';

const UploadPage: React.FC = () => {
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
