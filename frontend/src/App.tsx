import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SocketProvider } from './context/SocketContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'

// Pages
import LoginPage from './pages/auth/LoginPage'
import ChiefDashboard from './pages/chief/ChiefDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import NurseDashboard from './pages/nurse/NurseDashboard'
import PatientDashboard from './pages/patient/PatientDashboard'
import PatientDetail from './pages/shared/PatientDetail'

export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Chief Doctor */}
          <Route path="/chief" element={
            <ProtectedRoute allowedRoles={['chief_doctor']}>
              <ChiefDashboard />
            </ProtectedRoute>
          } />
          <Route path="/chief/patients/:id" element={
            <ProtectedRoute allowedRoles={['chief_doctor']}>
              <PatientDetail role="chief" />
            </ProtectedRoute>
          } />
          <Route path="/chief/patients" element={
            <ProtectedRoute allowedRoles={['chief_doctor']}>
              <ChiefDashboard />
            </ProtectedRoute>
          } />
          <Route path="/chief/staff" element={
            <ProtectedRoute allowedRoles={['chief_doctor']}>
              <ChiefDashboard />
            </ProtectedRoute>
          } />

          {/* Doctor */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients/:id" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PatientDetail role="doctor" />
            </ProtectedRoute>
          } />
          <Route path="/doctor/vitals" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />

          {/* Nurse */}
          <Route path="/nurse" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseDashboard />
            </ProtectedRoute>
          } />
          <Route path="/nurse/patients" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseDashboard />
            </ProtectedRoute>
          } />
          <Route path="/nurse/vitals" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseDashboard />
            </ProtectedRoute>
          } />

          {/* Patient */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/history" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  )
}
