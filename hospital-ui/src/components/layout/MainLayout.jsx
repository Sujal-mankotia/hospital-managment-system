import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileDrawer from './MobileDrawer'
import ToastStack from '../common/Toast'

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-bg">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <MobileDrawer />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 sm:px-6">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ToastStack />
    </div>
  )
}
