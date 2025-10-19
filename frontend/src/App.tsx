import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastProvider } from './components/common/Toast';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Loader } from './components/common/Loader';
import './App.css';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/Auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TaskListPage = lazy(() => import('./pages/Tasks/TaskListPage').then(m => ({ default: m.TaskListPage })));
const TaskFormPage = lazy(() => import('./pages/Tasks/TaskFormPage').then(m => ({ default: m.TaskFormPage })));
const TaskDetailPage = lazy(() => import('./pages/Tasks/TaskDetailPage').then(m => ({ default: m.TaskDetailPage })));
const AnalyticsPage = lazy(() => import('./pages/Analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage').then(m => ({ default: m.ProfilePage })));

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>
              <div className="app">
                <Suspense fallback={<Loader fullScreen text="Loading..." />}>
              <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <PrivateRoute>
                    <TaskListPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks/new"
                element={
                  <PrivateRoute>
                    <TaskFormPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks/:id/edit"
                element={
                  <PrivateRoute>
                    <TaskFormPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks/:id"
                element={
                  <PrivateRoute>
                    <TaskDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <AnalyticsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h1>404 - Page Not Found</h1>
                  </div>
                }
              />
              </Routes>
                </Suspense>
              </div>
            </ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
