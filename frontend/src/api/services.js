import api from './axios'

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
}

export const patientApi = {
  getAll: () => api.get('/patients'),
  getOne: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  assignDoctor: (id, doctorId) => api.patch(`/patients/${id}/assign-doctor`, { doctorId }),
  assignNurse: (id, nurseId) => api.patch(`/patients/${id}/assign-nurse`, { nurseId }),
  updateVitals: (id, data) => api.patch(`/patients/${id}/vitals`, data),
  getAuditLogs: (id) => api.get(`/patients/${id}/audit`),
  getStats: () => api.get('/patients/stats'),
}

export const userApi = {
  getAll: (role) => api.get('/users', { params: role ? { role } : {} }),
  getDoctors: () => api.get('/users', { params: { role: 'doctor' } }),
  getNurses: () => api.get('/users', { params: { role: 'nurse' } }),
}
