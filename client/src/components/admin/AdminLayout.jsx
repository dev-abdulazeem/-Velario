import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, ShoppingBag, Package, Users, Mail, BarChart3, Settings, 
  LogOut, Menu, ChevronRight, Bell, Search 
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/customers', icon: Users, label: 'Customers' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/emails', icon: Mail, label: 'Emails' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#111118] border-r border-white/5 
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo - Copied from Navbar */}
        <div className="p-6 border-b border-white/5">
          <Link to="/admin" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <path d="M10 10 L50 90 L90 10" stroke="#D4AF37" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M25 10 L50 60 L75 10" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.3"/>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                color: '#FFFFFF', 
                fontWeight: 800, 
                fontSize: '22px', 
                letterSpacing: '0.25em',
                lineHeight: 1,
              }}>
                VELARIO
              </span>
              <span style={{ 
                color: '#D4AF37', 
                fontSize: '9px', 
                letterSpacing: '0.35em', 
                textTransform: 'uppercase',
                marginTop: '2px',
                fontWeight: 500,
              }}>
                Movement With Style
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' 
                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all mb-2"
          >
            <Package size={18} />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-white/60 hover:text-white"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-white font-bold text-lg">
                {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                <Search size={16} className="text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search orders, products..."
                  className="bg-transparent text-white text-sm placeholder:text-white/30 outline-none w-48"
                />
              </div>
              <button className="relative p-2 text-white/60 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] rounded-full" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E8C547] flex items-center justify-center">
                <span className="text-[#0a0a0f] font-bold text-sm">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}