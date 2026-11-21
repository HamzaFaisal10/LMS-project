import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Courses from './pages/courses/Courses';
import CourseDetail from './pages/courses/CourseDetail';
import MyLearning from './pages/student/MyLearning';
import Learn from './pages/student/Learn';
import Checkout from './pages/student/Checkout';
import Purchases from './pages/student/Purchases';
import DashboardLayout from './layouts/DashboardLayout';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourses from './pages/instructor/InstructorCourses';
import CourseEditor from './pages/instructor/CourseEditor';
import InstructorStudents from './pages/instructor/InstructorStudents';
import { BookOpen, LayoutDashboard, Users } from 'lucide-react';

const INSTRUCTOR_NAV = [
  { to: '/instructor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/instructor/courses', label: 'My courses', icon: BookOpen },
  { to: '/instructor/students', label: 'Students', icon: Users },
];

function ComingSoon() {
  return (
    <div className="container-page py-24 text-center text-slate-500">
      Course catalog coming soon.
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/learn/:courseId"
          element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute roles={['instructor', 'admin']}>
              <DashboardLayout title="Instructor" items={INSTRUCTOR_NAV} />
            </ProtectedRoute>
          }
        >
          <Route index element={<InstructorDashboard />} />
          <Route path="courses" element={<InstructorCourses />} />
          <Route path="courses/:id" element={<CourseEditor />} />
          <Route path="students" element={<InstructorStudents />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
