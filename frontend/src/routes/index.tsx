import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import StudentsPage from '../pages/admin/StudentsPage';
import StudentDetailPage from '../pages/admin/StudentDetailPage';
import StudentFormPage from '../pages/admin/StudentFormPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import DriversPage from '../pages/admin/DriversPage'; 
import DriverDetailPage from '../pages/admin/DriversDetailPage';
import DriverFormPage from '../pages/admin/DriverFormPage';
import TripFinderPage from '../pages/admin/TripFinderPage';
import TripsPage from '../pages/admin/TripsPage';
import TripFormPage from '../pages/admin/TripFormPage';
import TripDetailPage from '../pages/admin/TripDetailPage';
import { isAdmin } from '../utils/auth';
import StudentDashboardPage from '../pages/StudentDashboardPage';

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isAdmin(user?.roles) ? '/admin' : '/student-dashboard'} replace />;
}

export const routes: RouteObject[] = [
  { path: '/', element: <HomeRedirect /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/admin', element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute> },
  { path: '/dashboard', element: <HomeRedirect /> },
  { path: '/drivers', element: <ProtectedRoute allowedRoles={['admin', 'student']}><DriversPage /></ProtectedRoute> },
  { path: '/students', element: <ProtectedRoute allowedRoles={['admin']}><StudentsPage /></ProtectedRoute> },
  { path: '/drivers/new', element: <ProtectedRoute allowedRoles={['admin']}><DriverFormPage mode="create" /></ProtectedRoute> },
  { path: '/drivers/:ssn', element: <ProtectedRoute allowedRoles={['admin', 'student']}><DriverDetailPage /></ProtectedRoute> },
  { path: '/drivers/:ssn/edit', element: <ProtectedRoute allowedRoles={['admin']}><DriverFormPage mode="edit" /></ProtectedRoute> },
  { path: '/students/new', element: <ProtectedRoute allowedRoles={['admin']}><StudentFormPage mode="create" /></ProtectedRoute> },
  { path: '/students/:ssn', element: <ProtectedRoute allowedRoles={['admin']}><StudentDetailPage /></ProtectedRoute> },
  { path: '/students/:ssn/edit', element: <ProtectedRoute allowedRoles={['admin']}><StudentFormPage mode="edit" /></ProtectedRoute> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },

  { path: 'trips', element: <ProtectedRoute allowedRoles={['admin', 'student']}><TripFinderPage /></ProtectedRoute> },
  { path: 'trips/all', element: <ProtectedRoute allowedRoles={['admin', 'student']}><TripsPage /></ProtectedRoute> },
  { path: 'trips/new', element: <ProtectedRoute allowedRoles={['admin', 'student']}><TripFormPage /></ProtectedRoute> },
  { path: 'trips/:tripId', element: <ProtectedRoute allowedRoles={['admin', 'student']}><TripDetailPage /></ProtectedRoute> },
  { path: 'trips/:tripId/edit', element: <ProtectedRoute allowedRoles={['admin']}><TripFormPage /></ProtectedRoute> },
  { path: '/student-dashboard', element: <ProtectedRoute allowedRoles={['admin','student']}><StudentDashboardPage /></ProtectedRoute> },
];
