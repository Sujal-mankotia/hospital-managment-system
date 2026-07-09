import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import LoginPage from './pages/Login/LoginPage'
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage'
import ResetPasswordPage from './pages/ForgotPassword/ResetPasswordPage'
import CreateUserPage from './pages/Admin/CreateUserPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import PatientsPage from './pages/Patients/PatientsPage'
import DoctorsPage from './pages/Doctors/DoctorsPage'
import DoctorProfilePage from './pages/Doctors/DoctorProfilePage'
import AppointmentsPage from './pages/Appointments/AppointmentsPage'
import BillingPage from './pages/Billing/BillingPage'
import PharmacyPage from './pages/Pharmacy/PharmacyPage'
import LabPage from './pages/Lab/LabPage'
import NotFoundPage from './pages/NotFound/NotFoundPage'

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
              <Route path="/admin/users/new" element={<ProtectedRoute allowedRoles={['admin']}><CreateUserPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/doctors/:id" element={<DoctorProfilePage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/pharmacy" element={<PharmacyPage />} />
              <Route path="/lab" element={<LabPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  )
}
