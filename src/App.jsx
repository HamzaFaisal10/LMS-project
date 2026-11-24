import { lazy, Suspense, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { BookOpen, CreditCard, LayoutDashboard, Tags, Users } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/ui';
import Home from './pages/Home';

// Route-level code splitting keeps the first page load small.
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Courses = lazy(() => import('./pages/courses/Courses'));
const CourseDetail = lazy(() => import('./pages/courses/CourseDetail'));
const MyLearning = lazy(() => import('./pages/student/MyLearning'));
const Learn = lazy(() => import('./pages/student/Learn'));
const Checkout = lazy(() => import('./pages/student/Checkout'));
const Purchases = lazy(() => import('./pages/student/Purchases'));
const InstructorDashboard = lazy(() => import('./pages/instructor/InstructorDashboard'));
const InstructorCourses = lazy(() => import('./pages/instructor/InstructorCourses'));
const CourseEditor = lazy(() => import('./pages/instructor/CourseEditor'));
const InstructorStudents = lazy(() => import('./pages/instructor/InstructorStudents'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));

const INSTRUCTOR_NAV = [
  { to: '/instructor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/instructor/courses', label: 'My courses', icon: BookOpen },
  { to: '/instructor/students', label: 'Students', icon: Users },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="font-display text-7xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">This page went off-syllabus</h1>
      <p className="mt-2 text-ink-muted">
        The page you are looking for doesn&apos;t exist or has moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}

const guard = (element, roles) => <ProtectedRoute roles={roles}>{element}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/learn/:courseId" element={guard(<Learn />)} />

          <Route
            path="/instructor"
            element={guard(<DashboardLayout title="Instructor" items={INSTRUCTOR_NAV} />, [
              'instructor',
              'admin',
            ])}
          >
            <Route index element={<InstructorDashboard />} />
            <Route path="courses" element={<InstructorCourses />} />
            <Route path="courses/:id" element={<CourseEditor />} />
            <Route path="students" element={<InstructorStudents />} />
          </Route>

          <Route
            path="/admin"
            element={guard(<DashboardLayout title="Admin" items={ADMIN_NAV} />, ['admin'])}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>

          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/my-learning" element={guard(<MyLearning />, ['student'])} />
            <Route path="/checkout/:slug" element={guard(<Checkout />, ['student'])} />
            <Route path="/purchases" element={guard(<Purchases />)} />
            <Route path="/profile" element={guard(<Profile />)} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
