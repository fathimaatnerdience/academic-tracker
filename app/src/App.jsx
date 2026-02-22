import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentDetails from './pages/StudentDetails';
import TeacherList from './pages/TeacherList';
import ParentList from './pages/ParentList';
import SubjectList from './pages/SubjectList';
import ClassList from './pages/ClassList';
import LessonList from './pages/LessonList';
import ExamList from './pages/ExamList';
import AssignmentList from './pages/AssignmentList';
import ResultList from './pages/ResultList';
import AttendanceList from './pages/AttendanceList';
import EventList from './pages/EventList';
import AnnouncementList from './pages/AnnouncementList';

// Layout
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#DDDB59' }}>
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
          <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#DDDB59" strokeWidth="4"/>
            <path className="opacity-75" fill="#1976D2" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/:id" element={<StudentDetails />} />
        <Route path="teachers" element={<TeacherList />} />
        <Route path="parents" element={<ParentList />} />
        <Route path="subjects" element={<SubjectList />} />
        <Route path="classes" element={<ClassList />} />
        <Route path="lessons" element={<LessonList />} />
        <Route path="exams" element={<ExamList />} />
        <Route path="assignments" element={<AssignmentList />} />
        <Route path="results" element={<ResultList />} />
        <Route path="attendance" element={<AttendanceList />} />
        <Route path="events" element={<EventList />} />
        <Route path="announcements" element={<AnnouncementList />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
