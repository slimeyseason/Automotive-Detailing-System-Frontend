// src/App.jsx
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import CustomerLayout from './layouts/CustomerLayout';
import DetailerLayout from './layouts/DetailerLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
// ...existing code...
import ForgotPassword from './pages/auth/ForgotPassword';
import Register from './pages/auth/Register.jsx';

import Home from './pages/customer/Home';
import Booking from './pages/customer/Booking';
import BookingSuccess from './pages/customer/BookingSuccess';
import MyBookings from './pages/customer/MyBookings';
import BookingDetail from './pages/customer/BookingDetail';
import Review from './pages/customer/Review';
import CustomerReviews from './pages/customer/Reviews';
import CustomerSettings from './pages/customer/Settings';

import DetailerDashboard from './pages/detailer/Dashboard';
import TodaysJobs from './pages/detailer/TodaysJobs';
import AvailableJobs from './pages/detailer/AvailableJobs';
import CurrentJobs from './pages/detailer/CurrentJobs';
import Schedule from './pages/detailer/Schedule';
import JobHistory from './pages/detailer/JobHistory';
import DetailerSettings from './pages/detailer/Settings';
import Earnings from './pages/detailer/Earnings';

import AdminDashboard from './pages/admin/Dashboard';
import Packages from './pages/admin/Packages';
import Bookings from './pages/admin/Bookings';
import Detailers from './pages/admin/Detailers';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

import Profile from './pages/shared/Profile';
import NotFound from './pages/shared/NotFound';
import TestMap from './pages/TestMap'; // Test page for Google Maps

// Public landing wrapper – shows Landing or redirects authenticated users
import { useEffect } from 'react';
const PublicLandingWrapper = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role) {
      let redirectPath = '/home'; // default for customer
      if (user.role === 'detailer') redirectPath = '/detailer';
      if (user.role === 'admin')    redirectPath = '/admin';
      navigate(redirectPath, { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (isAuthenticated && user?.role) {
    // Navigation handled in useEffect
    return null;
  }

  // Not authenticated → show landing page
  return <Landing />;
};

// Protected Route wrapper (unchanged)
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const redirectPath =
      user?.role === 'detailer' ? '/detailer' :
      user?.role === 'admin' ? '/admin' : '/home';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};


function App() {
  return (
    <Routes>
      {/* Public landing route at root (unauthenticated users see Landing) */}
      <Route path="/" element={<PublicLandingWrapper />} />

      {/* Customer protected routes (dashboard, bookings, etc) */}
      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
          <Route path="/review/:bookingId" element={<Review />} />
          <Route path="/reviews" element={<CustomerReviews />} />
          <Route path="/settings" element={<CustomerSettings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Detailer protected routes */}
      <Route element={<ProtectedRoute allowedRoles={['detailer']} />}>
        <Route element={<DetailerLayout />}>
          <Route path="/detailer" element={<DetailerDashboard />} />
          <Route path="/detailer/dashboard" element={<DetailerDashboard />} />
          <Route path="/detailer/jobs/today" element={<TodaysJobs />} />
          <Route path="/detailer/jobs/available" element={<AvailableJobs />} />
          <Route path="/detailer/jobs/current" element={<CurrentJobs />} />
          <Route path="/detailer/schedule" element={<Schedule />} />
          <Route path="/detailer/history" element={<JobHistory />} />
          <Route path="/detailer/earnings" element={<Earnings />} />
          <Route path="/detailer/settings" element={<DetailerSettings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin protected routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/packages" element={<Packages />} />
          <Route path="/admin/bookings" element={<Bookings />} />
          <Route path="/admin/detailers" element={<Detailers />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Test Routes (Development) */}
      <Route path="/test-map" element={<TestMap />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;