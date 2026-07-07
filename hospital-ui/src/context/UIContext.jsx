import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('hospital_theme') || 'light')
  const [toasts, setToasts] = useState([])

  const toggleSidebar = () => setSidebarCollapsed((v) => !v)
  const toggleMobileDrawer = () => setMobileDrawerOpen((v) => !v)

  const toggleDarkMode = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    const root = document.documentElement
    // Remove any previous theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-emerald', 'theme-purple')
    root.classList.add(`theme-${theme}`)

    // Keep standard Tailwind dark class sync
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('hospital_theme', theme)
  }, [theme])

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
        theme,
        setTheme,
        darkMode: theme === 'dark',
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

