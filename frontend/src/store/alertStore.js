import { create } from 'zustand'

export const useAlertStore = create((set, get) => ({
  alerts: [],

  addAlert: (alert) => {
    const id = Date.now() + Math.random()
    set((state) => ({
      alerts: [{ ...alert, id }, ...state.alerts].slice(0, 10),
    }))
    // Auto-dismiss after 8s
    setTimeout(() => get().removeAlert(id), 8000)
    return id
  },

  removeAlert: (id) => set((state) => ({
    alerts: state.alerts.filter((a) => a.id !== id),
  })),

  clearAll: () => set({ alerts: [] }),
}))
