import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import BrowseAgentsPage from './pages/BrowseAgentsPage';
import AgentDetailPage from './pages/AgentDetailPage';
import DeveloperHub from './pages/DeveloperHub';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';
import EmailVerificationPage from './pages/EmailVerificationPage';



function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } />
              <Route path="/register" element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              } />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/upload" element={
                <ProtectedRoute requireAuth={true}>
                  <UploadPage />
                </ProtectedRoute>
              } />
              <Route path="/agents" element={<BrowseAgentsPage />} />
              <Route path="/agents/:id" element={<AgentDetailPage />} />
              <Route path="/developers" element={<DeveloperHub />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}



export default App;