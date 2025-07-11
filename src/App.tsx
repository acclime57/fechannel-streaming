import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { WatchPage } from './pages/WatchPage';
import { SearchPage } from './pages/SearchPage';
import { CategoryPage } from './pages/CategoryPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { VideoForm } from './pages/admin/VideoForm';
import { NotFoundPage } from './pages/NotFoundPage';
import { SITE_CONFIG } from './config/constants';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <>
              <Header />
              <HomePage />
            </>
          } />
          
          <Route path="/watch/:id" element={
            <>
              <Header />
              <WatchPage />
            </>
          } />
          
          <Route path="/search" element={
            <>
              <Header />
              <SearchPage />
            </>
          } />
          
          <Route path="/categories/:categoryId" element={
            <>
              <Header />
              <CategoryPage />
            </>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/videos/new" element={<VideoForm />} />
          <Route path="/admin/videos/:id/edit" element={<VideoForm />} />
          
          {/* 404 Page */}
          <Route path="*" element={
            <>
              <Header />
              <NotFoundPage />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;