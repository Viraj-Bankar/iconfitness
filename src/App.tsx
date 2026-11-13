import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { OwnerLoginPage } from './pages/OwnerLoginPage';
import { OwnerGalleryDashboard } from './pages/OwnerGalleryDashboard';
import { OwnerPlansDashboard } from './pages/OwnerPlansDashboard';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website */}
        <Route path="/" element={<HomePage />} />

        {/* Owner Private Management Routes */}
        <Route path="/admin/login" element={<OwnerLoginPage />} />
        <Route path="/admin/gallery" element={<OwnerGalleryDashboard />} />
        <Route path="/admin/plans" element={<OwnerPlansDashboard />} />
        <Route path="/admin" element={<Navigate to="/admin/plans" replace />} />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
