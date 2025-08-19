import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface FormData {
  name: string;
  description: string;
  category: string;
  author_name: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  author_name?: string;
  file?: string;
}

const UploadForm: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    author_name: ''
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    { value: '', label: 'Select a category' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Customer Support', label: 'Customer Support' },
    { value: 'Content Creation', label: 'Content Creation' },
    { value: 'Data Analysis', label: 'Data Analysis' },
    { value: 'Research', label: 'Research' },
    { value: 'Education', label: 'Education' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'E-commerce', label: 'E-commerce' },
    { value: 'Other', label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateFile(selectedFile);
    }
  };

  const validateFile = (selectedFile: File) => {
    const newErrors: FormErrors = { ...errors };
    
    // Check file type
    if (!selectedFile.name.endsWith('.zip')) {
      newErrors.file = 'Please select a .zip file';
      setErrors(newErrors);
      return false;
    }
    
    // Check file size (50MB limit)
    if (selectedFile.size > 50 * 1024 * 1024) {
      newErrors.file = 'File size must be less than 50MB';
      setErrors(newErrors);
      return false;
    }
    
    // File is valid
    setFile(selectedFile);
    setErrors(prev => ({ ...prev, file: undefined }));
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Agent name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Agent name must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.author_name.trim()) {
      newErrors.author_name = 'Author name is required';
    }
    
    if (!file) {
      newErrors.file = 'Please select a file to upload';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    setErrors({}); // Clear any previous errors
    setMessage(null); // Clear any previous messages
    
    try {
      // Create FormData object with all form fields and file
      const uploadFormData = new FormData();
      uploadFormData.append('name', formData.name.trim());
      uploadFormData.append('description', formData.description.trim());
      uploadFormData.append('category', formData.category);
      uploadFormData.append('author_name', formData.author_name.trim());
      uploadFormData.append('file', file!);
      
      // Simulate upload progress (since we don't have actual progress from API)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Call upload API with FormData
      await apiService.uploadAgent(uploadFormData);
      
      // Complete progress
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      // Show success message
      setMessage({ type: 'success', text: 'Agent uploaded successfully! Redirecting to home page...' });
      
      setTimeout(() => {
        // Reset form
        handleReset();
        
        // Redirect to home page after successful upload
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to upload agent';
      
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        if (serverError?.message) {
          errorMessage = serverError.message;
        } else if (serverError?.error) {
          errorMessage = serverError.error;
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Network error - no response received
        errorMessage = 'Network error: Unable to connect to server';
      } else {
        // Other error
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      // Set error message
      setErrors({ file: errorMessage });
      setMessage({ type: 'error', text: `Upload failed: ${errorMessage}` });
      
    } finally {
      setLoading(false);
      // Keep progress at 100 for success, reset for error
      if (uploadProgress < 100) {
        setUploadProgress(0);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      author_name: ''
    });
    setFile(null);
    setErrors({});
    setUploadProgress(0);
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Upload New Agent</h2>
          <p className="text-blue-100 mt-1">Share your AI agent with the community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success/Error Message */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}
          {/* Agent Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Agent Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Enter agent name"
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Describe what your agent does, its capabilities, and use cases..."
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={loading}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Author Name */}
          <div>
            <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-2">
              Author Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author_name"
              name="author_name"
              value={formData.author_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.author_name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Your name or organization"
              disabled={loading}
            />
            {errors.author_name && (
              <p className="mt-1 text-sm text-red-600">{errors.author_name}</p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent File (.zip) <span className="text-red-500">*</span>
            </label>
            
            {/* Drag & Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : errors.file
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              
              <div className="space-y-2">
                <svg
                  className={`mx-auto h-12 w-12 ${
                    dragActive ? 'text-blue-400' : errors.file ? 'text-red-400' : 'text-gray-400'
                  }`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                
                <div className="text-sm">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </div>
                
                <p className="text-xs text-gray-500">
                  ZIP file up to 50MB
                </p>
              </div>
            </div>
            
            {/* File Info */}
            {file && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800">{file.name}</p>
                      <p className="text-xs text-green-600">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {errors.file && (
              <p className="mt-1 text-sm text-red-600">{errors.file}</p>
            )}
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  {uploadProgress === 100 ? 'Upload Complete!' : 'Uploading...'}
                </span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    uploadProgress === 100 ? 'bg-green-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <p className="text-xs text-gray-500">
                  Please wait while your agent is being uploaded...
                </p>
              )}
              {uploadProgress === 100 && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Upload successful! Redirecting...
                </p>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 border border-transparent rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploadProgress === 100 ? 'Processing...' : 'Uploading...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Agent
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;
