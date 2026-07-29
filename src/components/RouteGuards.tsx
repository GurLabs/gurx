import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ConsoleShellSkeleton } from './ui/Skeleton';
import type { UserRole } from '../types';

/**
 * Oturum hazır olana kadar boş bir "kontrol ediliyor" ekranı yerine konsolun
 * iskeleti gösterilir; kontrol bittiğinde yalnızca içerik yerine oturur.
 */
export const RequireAuth: React.FC = () => {
  const { ready, user } = useAuth();
  const location = useLocation();

  if (!ready) return <ConsoleShellSkeleton label="Oturum kontrol ediliyor" />;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/giris?next=${next}`} replace />;
  }

  return <Outlet />;
};

export const RequireRole: React.FC<{ allow: UserRole[] }> = ({ allow }) => {
  const { ready, user, role } = useAuth();
  const location = useLocation();

  if (!ready) return <ConsoleShellSkeleton label="Yetki kontrol ediliyor" />;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/giris?next=${next}`} replace />;
  }

  if (!allow.includes(role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
