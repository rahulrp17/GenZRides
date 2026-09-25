import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Role-aware route guard.
 * - Guests (no user) → /login (with `from` so login can redirect back).
 * - Signed-in user with wrong role → /unauthorized (401 page, with
 *   `requiredRole` + `from` so the 401 page can explain + link home).
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from }} replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const requiredRole = allowedRoles.length === 1 ? allowedRoles[0] : null;
    return <Navigate to="/unauthorized" state={{ requiredRole, from }} replace />;
  }

  return children;
};

export default ProtectedRoute;
