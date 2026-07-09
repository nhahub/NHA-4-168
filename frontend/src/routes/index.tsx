import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
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

export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/admin" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/admin', element: <ProtectedRoute><AdminDashboardPage /></ProtectedRoute> },
  { path: '/dashboard', element: <Navigate to="/admin" replace /> },
  { path:"/drivers" ,element:<ProtectedRoute><DriversPage /></ProtectedRoute>},
  { path: '/students', element: <ProtectedRoute><StudentsPage /></ProtectedRoute> },
  { path: '/drivers', element: <ProtectedRoute><DriversPage /></ProtectedRoute> },
  { path: '/drivers/new', element: <ProtectedRoute><DriverFormPage mode="create" /></ProtectedRoute> },
  { path: '/drivers/:ssn', element: <ProtectedRoute><DriverDetailPage /></ProtectedRoute> },
  { path: '/drivers/:ssn/edit', element: <ProtectedRoute><DriverFormPage mode="edit" /></ProtectedRoute> },
  { path: '/students/new', element: <ProtectedRoute><StudentFormPage mode="create" /></ProtectedRoute> },
  { path: '/students/:ssn', element: <ProtectedRoute><StudentDetailPage /></ProtectedRoute> },
  { path: '/students/:ssn/edit', element: <ProtectedRoute><StudentFormPage mode="edit" /></ProtectedRoute> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '*', element: <NotFoundPage /> },
  { path: 'trips', element: <ProtectedRoute><TripFinderPage /></ProtectedRoute> },
  { path: 'trips/all', element: <ProtectedRoute><TripsPage /></ProtectedRoute> },
  { path: 'trips/new', element: <ProtectedRoute><TripFormPage /></ProtectedRoute> },
  { path: 'trips/:tripId', element: <ProtectedRoute><TripDetailPage /></ProtectedRoute> },
  { path: 'trips/:tripId/edit', element: <ProtectedRoute><TripFormPage /></ProtectedRoute> },
];
