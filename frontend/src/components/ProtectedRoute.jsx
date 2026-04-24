import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const roleRoutes = {
  chief_doctor: '/chief',
  doctor: '/doctor',
  nurse: '/nurse',
  patient: '/patient',
}

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />
  }

  return children
}

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated && user) {
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />
  }
  return children
}
