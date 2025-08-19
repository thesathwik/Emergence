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
import ApiExample from './components/ApiExample';
import AgentCardDemo from './components/AgentCardDemo';
import CategoryFilterDemo from './components/CategoryFilterDemo';
import FilterIntegrationDemo from './components/FilterIntegrationDemo';
import DownloadFunctionalityDemo from './components/DownloadFunctionalityDemo';
import ErrorHandlingDemo from './components/ErrorHandlingDemo';
import UIPolishDemo from './components/UIPolishDemo';

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
            <Route path="/api-example" element={<ApiExample />} />
            <Route path="/agent-cards" element={<AgentCardDemo />} />
            <Route path="/category-filter" element={<CategoryFilterDemo />} />
            <Route path="/filter-integration" element={<FilterIntegrationDemo />} />
            <Route path="/download-demo" element={<DownloadFunctionalityDemo />} />
            <Route path="/error-demo" element={<ErrorHandlingDemo />} />
            <Route path="/ui-demo" element={<UIPolishDemo />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}



export default App;
