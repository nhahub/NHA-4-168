import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import StudentsPage from '../pages/admin/StudentsPage';
import StudentDetailPage from '../pages/admin/StudentDetailPage';
import StudentFormPage from '../pages/admin/StudentFormPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/students',
    element: <ProtectedRoute><StudentsPage /></ProtectedRoute>,
  },
  {
    path: '/students/new',
    element: <ProtectedRoute><StudentFormPage mode="create" /></ProtectedRoute>,
  },
  {
    path: '/students/:ssn',
    element: <ProtectedRoute><StudentDetailPage /></ProtectedRoute>,
  },
  {
    path: '/students/:ssn/edit',
    element: <ProtectedRoute><StudentFormPage mode="edit" /></ProtectedRoute>,
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
