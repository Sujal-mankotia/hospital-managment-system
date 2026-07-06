import { createContext, useContext, useState, useCallback } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [toasts, setToasts] = useState([])

  const toggleSidebar = () => setSidebarCollapsed((v) => !v)
  const toggleMobileDrawer = () => setMobileDrawerOpen((v) => !v)
  const toggleDarkMode = () => setDarkMode((v) => !v)

  const pushToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, type: 'info', ...toast }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3500)
  }, [])

  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  return (
    <UIContext.Provider
      value={{
        sidebarCollapsed,
        toggleSidebar,
        mobileDrawerOpen,
        toggleMobileDrawer,
        setMobileDrawerOpen,
        darkMode,
        toggleDarkMode,
        toasts,
        pushToast,
        dismissToast,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export const useUI = () => useContext(UIContext)
