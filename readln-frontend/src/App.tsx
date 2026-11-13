import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Reader Pages
import { HomePage } from './pages/HomePage';
import { StoryDetailPage } from './pages/stories/StoryDetailPage';
import { ChapterReaderPage } from './pages/stories/ChapterReaderPage';
import { CategoryPage } from './pages/stories/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminStoriesPage } from './pages/admin/AdminStoriesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminOperationsPage } from './pages/admin/AdminOperationsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Nhánh giao diện chính dành cho độc giả */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stories/:id" element={<StoryDetailPage />} />
          <Route path="/stories/:storyId/chapters/:chapterId" element={<ChapterReaderPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* Vùng yêu cầu đăng nhập */}
          <Route element={<ProtectedRoute requiredRole="USER" />}>
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Nhánh Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Nhánh Quản trị viên (Admin Portal - Phân quyền RBAC) */}
        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="stories" element={<AdminStoriesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="logs" element={<AdminLogsPage />} />
            <Route path="operations" element={<AdminOperationsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
