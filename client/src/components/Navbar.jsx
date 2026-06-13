import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ShoppingBag, User, Search, Heart } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useSearch } from '../context/SearchContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  
  const { user, logout, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const { openSearch } = useSearch()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories')
        const cats = Array.isArray(res.data) ? res.data.map(c => 
          typeof c === 'string' ? { name: c, slug: c.toLowerCase() } : { name: c.name, slug: c.slug || c.name.toLowerCase() }
        ) : []
        setCategories(cats)
      } catch (err) {
        console.error('Failed to fetch categories:', err.message)
        setCategories([
          { name: 'Men', slug: 'men' },
          { name: 'Women', slug: 'women' },
        ])
      } finally {
        setCatLoading(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    setShowUserMenu(false)
  }, [location])

  const baseNavLinks = [
    { name: 'HOME', path: '/' },
    { name: 'SHOP', path: '/shop' },
  ]
  
  const categoryLinks = categories.map(cat => ({
    name: cat.name.toUpperCase(),
    path: `/shop?category=${encodeURIComponent(cat.name)}`,
  }))
  
  const navLinks = [...baseNavLinks, ...categoryLinks, { name: 'COLLECTIONS', path: '/shop?featured=true' }]

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      transition: 'all 0.5s ease',
      backgroundColor: isScrolled ? 'rgba(15, 15, 15, 0.95)' : 'transparent',
      backdropFilter: isScrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none',
      borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
    }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline">
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <path d="M10 10 L50 90 L90 10" stroke="#D4AF37" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M25 10 L50 60 L75 10" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.3"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-[22px] tracking-[0.25em] leading-none">
                VELARIO
              </span>
              <span className="text-[#D4AF37] text-[9px] tracking-[0.35em] uppercase mt-0.5 font-medium">
                Movement With Style
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => {
              const isActive = location.pathname + location.search === link.path || 
                (link.path !== '/' && location.search.includes(link.path.split('?')[1]))
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[11px] tracking-[0.2em] font-medium relative pb-1 whitespace-nowrap transition-all duration-300 ${
                    isActive ? 'text-[#D4AF37]' : 'text-white/70 hover:text-[#D4AF37]'
                  }`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-px bg-[#D4AF37] transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0'
                  }`} />
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            
            <button 
              onClick={openSearch}
              className="p-2.5 text-white/60 hover:text-[#D4AF37] transition-colors bg-transparent border-none cursor-pointer"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            <Link to="/wishlist" className="p-2.5 text-white/60 hover:text-[#D4AF37] relative transition-colors no-underline">
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] bg-[#D4AF37] text-[#0F0F0F] text-[10px] font-extrabold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="p-2.5 text-white/60 hover:text-[#D4AF37] relative transition-colors no-underline">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] bg-[#D4AF37] text-[#0F0F0F] text-[10px] font-extrabold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 p-2.5 text-white/60 hover:text-[#D4AF37] transition-colors bg-transparent border-none cursor-pointer"
                >
                  <User size={20} strokeWidth={1.5} />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-[#1A1A1A] border border-white/[0.08] rounded-xl overflow-hidden z-[100] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                    <div className="p-4 border-b border-white/5">
                      <p className="text-white text-sm font-semibold">{user.fullName}</p>
                      <p className="text-white/40 text-xs mt-0.5">{user.email}</p>
                    </div>
                    <Link to="/wishlist" className="block px-4 py-3 text-[13px] text-white/70 no-underline hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all">
                      My Wishlist ({wishlistCount})
                    </Link>
                    <Link to="/orders" className="block px-4 py-3 text-[13px] text-white/70 no-underline hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all">
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-3 text-[13px] text-[#D4AF37] no-underline hover:bg-[#D4AF37]/10 transition-all">
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); navigate('/') }}
                      className="w-full text-left px-4 py-3 text-[13px] text-red-400 hover:bg-red-500/10 transition-all bg-transparent border-none cursor-pointer border-t border-white/5"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0F0F0F] text-[11px] font-bold tracking-[0.15em] rounded-md no-underline transition-all"
              >
                SIGN IN
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-white bg-transparent border-none cursor-pointer lg:hidden"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="block lg:hidden bg-[#0F0F0F]/98 backdrop-blur-xl border-t border-white/5 p-6 max-h-[70vh] overflow-y-auto">
          {navLinks.map(link => {
            const isActive = location.pathname + location.search === link.path
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`block text-sm tracking-[0.2em] py-3 border-b border-white/5 no-underline transition-colors ${
                  isActive ? 'text-[#D4AF37]' : 'text-white/80'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          <Link to="/wishlist" className="block text-sm tracking-[0.2em] text-[#D4AF37] py-3 border-b border-white/5 no-underline">
            WISHLIST ({wishlistCount})
          </Link>
          {!user && (
            <div className="pt-6 flex flex-col gap-3">
              <Link to="/login" className="block w-full text-center py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0F0F0F] text-[13px] font-bold tracking-[0.15em] rounded-lg no-underline">
                SIGN IN
              </Link>
              <Link to="/register" className="block w-full text-center py-3.5 border border-[#D4AF37] text-[#D4AF37] text-[13px] font-bold tracking-[0.15em] rounded-lg no-underline">
                CREATE ACCOUNT
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}