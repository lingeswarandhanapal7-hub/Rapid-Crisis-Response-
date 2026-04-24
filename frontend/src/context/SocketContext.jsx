import { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useAlertStore } from '../store/alertStore'
import { useQueryClient } from '@tanstack/react-query'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  const { addAlert } = useAlertStore()
  const queryClient = useQueryClient()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join:role', user.role)
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
      socketRef.current = null
    }
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
