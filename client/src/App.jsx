import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Operations from './pages/staff/Operations';
import AdminDashboard from './pages/admin/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public guest routes */}
                <Route path="/" element={<Home />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/hotels/:hotelId" element={<HotelDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Guest authenticated routes */}
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <Bookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Staff / Operations routes */}
                <Route
                  path="/operations"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <Operations />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
