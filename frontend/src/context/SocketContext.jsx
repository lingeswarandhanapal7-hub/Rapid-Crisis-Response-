import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useAlertStore } from '../store/alertStore'
import { useQueryClient } from '@tanstack/react-query'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  const { addAlert } = useAlertStore()
  const queryClient = useQueryClient()
  const [socketInstance, setSocketInstance] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const socket = io('http://localhost:5000', {
      withCredentials: true,
    })

    setSocketInstance(socket)

    socket.on('connect', () => {
      socket.emit('join:role', user.role)
      const userId = user._id || user.id
      if (userId) {
        socket.emit('join:user', userId)
      }
      if (user.role === 'chief_doctor') {
        socket.emit('emergency:join', { role: user.role })
      }
    })

    socket.on('patient:vitals', (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patient', data.patientId] })
    })

    socket.on('patient:created', () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    })

    socket.on('patient:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    })

    socket.on('alert:critical', (data) => {
      addAlert({ type: 'critical', message: data.message, patient: data.patient, timestamp: data.timestamp })
    })

    socket.on('alert:warning', (data) => {
      addAlert({ type: 'warning', message: data.message, patient: data.patient, timestamp: data.timestamp })
    })

    return () => {
      socket.disconnect()
      setSocketInstance(null)
    }
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider value={socketInstance}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
