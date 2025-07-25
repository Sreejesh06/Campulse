import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Announcements from './pages/Announcements';
import AnnouncementDetail from './pages/AnnouncementDetail';
import LostFound from './pages/LostFound';
import LostFoundDetail from './pages/LostFoundDetail';
import Timetable from './pages/Timetable';
import Complaints from './pages/Complaints';
import ComplaintDetail from './pages/ComplaintDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/announcements" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Announcements />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/announcements/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AnnouncementDetail />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/lost-found" element={
                <ProtectedRoute>
                  <AppLayout>
                    <LostFound />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/lost-found/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <LostFoundDetail />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/timetable" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Timetable />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/complaints" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Complaints />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/complaints/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ComplaintDetail />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute adminOnly>
                  <AppLayout>
                    <AdminDashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Layout wrapper for authenticated pages
const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default App;
