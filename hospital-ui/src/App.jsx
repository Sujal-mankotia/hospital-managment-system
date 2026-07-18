import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import LoginPage from './pages/Login/LoginPage'
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage'
import ResetPasswordPage from './pages/ForgotPassword/ResetPasswordPage'
import CreateUserPage from './pages/Admin/CreateUserPage'
import UsersPage from './pages/Admin/UsersPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import PatientsPage from './pages/Patients/PatientsPage'
import DoctorsPage from './pages/Doctors/DoctorsPage'
import DoctorProfilePage from './pages/Doctors/DoctorProfilePage'
import AppointmentsPage from './pages/Appointments/AppointmentsPage'
import BillingPage from './pages/Billing/BillingPage'
import PharmacyPage from './pages/Pharmacy/PharmacyPage'
import LabPage from './pages/Lab/LabPage'
import ReportsPage from './pages/Reports/ReportsPage'
import SettingsPage from './pages/Settings/SettingsPage'
import NotFoundPage from './pages/NotFound/NotFoundPage'

// Role groups
const STAFF = ['admin', 'doctor', 'receptionist']
const ALL_ROLES = ['admin', 'doctor', 'receptionist', 'patient']

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Admin-only routes */}
              <Route path="/admin/users/new" element={<ProtectedRoute allowedRoles={['admin']}><CreateUserPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />

              {/* All authenticated users */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={ALL_ROLES}><DashboardPage /></ProtectedRoute>} />
              <Route path="/doctors" element={<ProtectedRoute allowedRoles={ALL_ROLES}><DoctorsPage /></ProtectedRoute>} />
              <Route path="/doctors/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><DoctorProfilePage /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute allowedRoles={ALL_ROLES}><AppointmentsPage /></ProtectedRoute>} />

              {/* Staff + admin only */}
              <Route path="/patients" element={<ProtectedRoute allowedRoles={STAFF}><PatientsPage /></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute allowedRoles={STAFF}><BillingPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={STAFF}><ReportsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute allowedRoles={ALL_ROLES}><SettingsPage /></ProtectedRoute>} />
              <Route path="/pharmacy" element={<ProtectedRoute allowedRoles={STAFF}><PharmacyPage /></ProtectedRoute>} />
              <Route path="/lab" element={<ProtectedRoute allowedRoles={STAFF}><LabPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  )
}
