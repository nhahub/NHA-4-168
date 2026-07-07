import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/admin" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute><AdminDashboardPage /></ProtectedRoute>, // TODO: re-add allowedRoles={['Admin']} once backend returns correct role claim
  },
  {
    path: '/dashboard',
    element: <Navigate to="/admin" replace />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
