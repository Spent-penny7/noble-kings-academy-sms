import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import db, { supabase } from './supabase/client';
import './App.css';

import LoginPage from './components/auth/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import PublicWebsite from './components/public/PublicWebsite';

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const { session } = await db.getSession();
        if (!isMounted) return;
        if (session?.user?.id) {
          const role = await db.getUserRole(session.user.id);
          const isApproved = await db.isUserApproved(session.user.id, role);
          if (!role || (!isApproved && role !== 'admin')) {
            await db.signOut();
            if (isMounted) {
              setSession(null);
              setUserRole(null);
            }
          } else {
            if (isMounted) {
              setSession(session);
              setUserRole(role);
            }
          }
        } else {
          if (isMounted) {
            setSession(null);
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        if (isMounted) {
          setSession(null);
          setUserRole(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();

    // Listen for storage events (e.g. login/logout state change)
    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sms_auth_change', handleStorageChange);

    // Listen for Supabase auth state change if configured
    let subscription = null;
    if (db.isConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        if (session?.user?.id) {
          const role = await db.getUserRole(session.user.id);
          const isApproved = await db.isUserApproved(session.user.id, role);
          if (!isApproved && role !== 'admin') {
            await db.signOut();
            if (isMounted) {
              setSession(null);
              setUserRole(null);
            }
          } else {
            if (isMounted) setUserRole(role);
          }
        } else {
          if (isMounted) setUserRole(null);
        }
        if (isMounted) setLoading(false);
      });
      subscription = data?.subscription;
    }

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sms_auth_change', handleStorageChange);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await db.signOut();
    setSession(null);
    setUserRole(null);
    window.dispatchEvent(new Event('sms_auth_change'));
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading school portal...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public portal routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/public-site" element={<PublicWebsite />} />
        <Route
          path="/login"
          element={
            session && userRole ? (
              userRole === 'teacher' ? <Navigate to="/teacher" replace /> :
              userRole === 'student' ? <Navigate to="/student" replace /> :
              <Navigate to="/admin" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Protected routes */}
        <Route 
          path="/admin/*" 
          element={
            session && userRole === 'admin' 
              ? <AdminDashboard onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/teacher/*" 
          element={
            session && (userRole === 'teacher' || userRole === 'admin')
              ? <TeacherDashboard onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/student/*" 
          element={
            session && (userRole === 'student' || userRole === 'admin')
              ? <StudentDashboard onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;