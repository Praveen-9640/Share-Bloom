import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Navbar from './components/Navbar';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Donations from './pages/Donations';
import Requests from './pages/Requests';
import Drives from './pages/Drives';

// Feature Pages (New)
import EasyDonations from './pages/EasyDonations';
import CommunitySupport from './pages/CommunitySupport';
import OrganizedDrives from './pages/OrganizedDrives';
import EmergencyResponse from './pages/EmergencyResponse';

// User Protected Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateDonation from './pages/CreateDonation';
import CreateRequest from './pages/CreateRequest';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import Reports from './pages/Reports';
import SystemOverview from './pages/SystemOverview';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">

          <Navbar />

          <main>
            <Routes>
              {/* --- PUBLIC ROUTES --- */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/donations" element={<Donations />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/drives" element={<Drives />} />

              {/* Feature Pages (Linked from Home Cards) */}
              <Route path="/easy-donations" element={<EasyDonations />} />
              <Route path="/community-support" element={<CommunitySupport />} />
              <Route path="/organized-drives" element={<OrganizedDrives />} />
              <Route path="/emergency-response" element={<EmergencyResponse />} />

              {/* --- USER PROTECTED ROUTES --- */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="/create-donation" element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <CreateDonation />
                </ProtectedRoute>
              } />

              <Route path="/create-request" element={
                <ProtectedRoute allowedRoles={['recipient']}>
                  <CreateRequest />
                </ProtectedRoute>
              } />

              {/* --- ADMIN ROUTES --- */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              } />

              <Route path="/admin/reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Reports />
                </ProtectedRoute>
              } />

              <Route path="/admin/system" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SystemOverview />
                </ProtectedRoute>
              } />

            </Routes>
          </main>

          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;