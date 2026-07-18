import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import StudentsPage from '../pages/admin/StudentsPage';
import StudentDetailPage from '../pages/admin/StudentDetailPage';
import StudentFormPage from '../pages/admin/StudentFormPage';
import StudentDashboardPage from '../pages/StudentDashboardPage';
import StudentTripsPage from '../pages/StudentTripsPage';
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
import CoursesPage from '../pages/admin/CoursesPage';
import CourseDetailPage from '../pages/admin/CourseDetailPage';
import CourseFormPage from '../pages/admin/CourseFormPage';
import InstructorsPage from '../pages/admin/InstructorsPage';
import InstructorDetailPage from '../pages/admin/InstructorDetailPage';
import InstructorFormPage from '../pages/admin/InstructorFormPage';
import InstructorDashboardPage from '../pages/InstructorDashboardPage';
import InstructorCoursesPage from '../pages/instructor/InstructorCoursesPage';
import InstructorPaymentsPage from '../pages/instructor/InstructorPaymentsPage';
import DriverDashboardPage from '../pages/DriverDashboardPage';
import { isAdmin, isStudent, isInstructor, isDriver } from '../utils/auth';
import EnrollmentManagementPage from "../pages/Enrollment/EnrollmentManagementPage";
import StudentEnrollmentsPage from "../pages/Enrollment/StudentEnrollmentsPage";
import PaymentManagementPage from "../pages/payment/PaymentManagementPage";
import StudentPaymentHistoryPage from "../pages/payment/StudentPaymentHistoryPage";
import StudentCompletePaymentPage from "../pages/payment/StudentCompletePaymentPage";
import DriverTripsPage from "../pages/driver/DriverTripsPage";
import DriverMyTripsPage from "../pages/driver/DriverMyTripsPage";
import DriverPaymentsPage from "../pages/driver/DriverPaymentsPage";
import RateInstructorsPage from "../pages/student/RateInstructorsPage";

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  let redirectTo = '/drivers';
  if (isAdmin(user?.roles)) {
    redirectTo = '/admin';
  } else if (isStudent(user?.roles)) {
    redirectTo = '/student-dashboard';
  } else if (isInstructor(user?.roles)) {
    redirectTo = '/instructor-dashboard';
  } else if (isDriver(user?.roles)) {
    redirectTo = '/driver-dashboard';
  }

  return <Navigate to={redirectTo} replace />;
}

export const routes: RouteObject[] = [
  { path: '/', element: <HomeRedirect /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/admin', element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute> },
  { path: '/student-dashboard', element: <ProtectedRoute allowedRoles={['admin', 'student']}><StudentDashboardPage /></ProtectedRoute> },
  { path: '/instructor-dashboard', element: <ProtectedRoute allowedRoles={['admin', 'instructor']}><InstructorDashboardPage /></ProtectedRoute> },
  { path: '/driver-dashboard', element: <ProtectedRoute allowedRoles={['admin', 'driver']}><DriverDashboardPage /></ProtectedRoute> },
  { path: '/student/trips', element: <ProtectedRoute allowedRoles={['admin', 'student']}><StudentTripsPage /></ProtectedRoute> },
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
  { path: '/courses', element: <ProtectedRoute allowedRoles={['admin', 'student']}><CoursesPage /></ProtectedRoute> },
  { path: '/courses/new', element: <ProtectedRoute allowedRoles={['admin']}><CourseFormPage mode="create" /></ProtectedRoute> },
  { path: '/courses/:courseId', element: <ProtectedRoute allowedRoles={['admin', 'student', 'instructor']}><CourseDetailPage /></ProtectedRoute> },
  { path: '/courses/:courseId/edit', element: <ProtectedRoute allowedRoles={['admin']}><CourseFormPage mode="edit" /></ProtectedRoute> },
  { path: '/instructors', element: <ProtectedRoute allowedRoles={['admin', 'student']}><InstructorsPage /></ProtectedRoute> },
  { path: '/instructors/new', element: <ProtectedRoute allowedRoles={['admin']}><InstructorFormPage mode="create" /></ProtectedRoute> },
  { path: '/instructors/:ssn', element: <ProtectedRoute allowedRoles={['admin', 'student']}><InstructorDetailPage /></ProtectedRoute> },
  { path: '/instructors/:ssn/edit', element: <ProtectedRoute allowedRoles={['admin']}><InstructorFormPage mode="edit" /></ProtectedRoute> },
  { path: '/instructor/courses', element: <ProtectedRoute allowedRoles={['admin', 'instructor']}><InstructorCoursesPage /></ProtectedRoute> },
  { path: '/instructor/payments', element: <ProtectedRoute allowedRoles={['admin', 'instructor']}><InstructorPaymentsPage /></ProtectedRoute> },
  { path: '/admin/enrollments', element: <ProtectedRoute allowedRoles={['admin']}><EnrollmentManagementPage /></ProtectedRoute> },
  { path: '/admin/payments', element: <ProtectedRoute allowedRoles={['admin']}><PaymentManagementPage /></ProtectedRoute> },
  { path: '/student/enrollments', element: <ProtectedRoute allowedRoles={['student', 'admin']}><StudentEnrollmentsPage /></ProtectedRoute> },
  { path: '/student/payments', element: <ProtectedRoute allowedRoles={['student', 'admin']}><StudentPaymentHistoryPage /></ProtectedRoute> },
  { path: '/student/rate-instructors', element: <ProtectedRoute allowedRoles={['student', 'admin']}><RateInstructorsPage /></ProtectedRoute> },
  { path: '/student/payments/:enrollmentId/complete', element: <ProtectedRoute allowedRoles={['student', 'admin']}><StudentCompletePaymentPage /></ProtectedRoute> },
  { path: '/student/payments/trip/:tripId/complete', element: <ProtectedRoute allowedRoles={['student', 'admin']}><StudentCompletePaymentPage /></ProtectedRoute> },
  { path: '/driver/trips', element: <ProtectedRoute allowedRoles={['admin', 'driver']}><DriverTripsPage /></ProtectedRoute> },
  { path: '/driver/my-trips', element: <ProtectedRoute allowedRoles={['admin', 'driver']}><DriverMyTripsPage /></ProtectedRoute> },
  { path: '/driver/payments', element: <ProtectedRoute allowedRoles={['admin', 'driver']}><DriverPaymentsPage /></ProtectedRoute> },
  { path: '*', element: <NotFoundPage /> },
];
