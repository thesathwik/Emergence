import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import BrowseAgentsPage from './pages/BrowseAgentsPage';
import AgentDetailPage from './pages/AgentDetailPage';
import NotFoundPage from './pages/NotFoundPage';



function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/agents" element={<BrowseAgentsPage />} />
            <Route path="/agents/:id" element={<AgentDetailPage />} />
    

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}



export default App;
