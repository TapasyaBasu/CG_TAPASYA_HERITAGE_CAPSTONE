import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import { seedDefaultData } from './utils/storage';

// Pages
import Login from './pages/student/Login';
import ExamList from './pages/student/ExamList';
import StartExam from './pages/student/StartExam';
import ExamInterface from './pages/student/ExamInterface';
import ResultPage from './pages/student/ResultPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateExam from './pages/admin/CreateExam';
import ManageQuestions from './pages/admin/ManageQuestions';
import ViewResults from './pages/admin/ViewResults';

// Seed default data on app load
seedDefaultData();

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Student Routes */}
          <Route path="/student/exams" element={
            <ProtectedRoute role="student"><ExamList /></ProtectedRoute>
          } />
          <Route path="/student/exam/:id/start" element={
            <ProtectedRoute role="student"><StartExam /></ProtectedRoute>
          } />
          <Route path="/student/exam/:id/test" element={
            <ProtectedRoute role="student"><ExamInterface /></ProtectedRoute>
          } />
          <Route path="/student/exam/:id/result" element={
            <ProtectedRoute role="student"><ResultPage /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/exam/create" element={
            <ProtectedRoute role="admin"><CreateExam /></ProtectedRoute>
          } />
          <Route path="/admin/exam/:id/edit" element={
            <ProtectedRoute role="admin"><CreateExam /></ProtectedRoute>
          } />
          <Route path="/admin/exam/:id/questions" element={
            <ProtectedRoute role="admin"><ManageQuestions /></ProtectedRoute>
          } />
          <Route path="/admin/results" element={
            <ProtectedRoute role="admin"><ViewResults /></ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
