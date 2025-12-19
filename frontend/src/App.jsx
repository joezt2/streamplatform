import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ContentList from './pages/ContentList';
import ContentDetail from './pages/ContentDetail';
import ContentForm from './pages/ContentForm';
import Analytics from './pages/Analytics';
import Ratings from './pages/Ratings';  // ← NUOVO

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contents" element={<ContentList />} />
          <Route path="/contents/:id" element={<ContentDetail />} />
          <Route path="/contents/new" element={<ContentForm />} />
          <Route path="/contents/edit/:id" element={<ContentForm />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ratings" element={<Ratings />} />  {/* ← NUOVO */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;