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
