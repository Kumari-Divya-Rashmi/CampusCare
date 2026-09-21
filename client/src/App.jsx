import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import NotificationBell from "./components/NotificationBell";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import StudentDashboard from "./pages/StudentDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import CreateComplaintPage from "./pages/CreateComplaintPage";
import ComplaintDetailsPage from "./pages/ComplaintDetailsPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";

import UnauthorizedPage from "./pages/UnauthorizedPage";

import "./App.css";

function App() {
  return (
    <>
      <NotificationBell />

      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="/register"
          element={
            <RegisterPage />
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute
              allowedRoles={[
                "student",
              ]}
            >
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/complaints/new"
          element={
            <ProtectedRoute
              allowedRoles={[
                "student",
              ]}
            >
              <CreateComplaintPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/complaints/:complaintId"
          element={
            <ProtectedRoute
              allowedRoles={[
                "student",
              ]}
            >
              <ComplaintDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute
              allowedRoles={[
                "staff",
              ]}
            >
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/complaints/:complaintId"
          element={
            <ProtectedRoute
              allowedRoles={[
                "staff",
              ]}
            >
              <ComplaintDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <AdminAnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/complaints/:complaintId"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <ComplaintDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/unauthorized"
          element={
            <UnauthorizedPage />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;