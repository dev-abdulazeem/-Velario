import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ShoppingBag, User, Search, Heart, ArrowRight, Crown, LogOut, Package, ChevronRight } from 'lucide-react'
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredLink, setHoveredLink] = useState(null)
  const searchInputRef = useRef(null)
  
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
    setMobileSearchOpen(false)
    setSearchQuery('')
  }, [location])

  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [mobileSearchOpen])

  const handleMobileSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setMobileSearchOpen(false)
      setSearchQuery('')
    }
  }

  const baseNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
  ]
  
  const categoryLinks = categories.map(cat => ({
    name: cat.name,
    path: `/shop?category=${encodeURIComponent(cat.name)}`,
  }))
  
  const navLinks = [...baseNavLinks, ...categoryLinks, { name: 'Collections', path: '/shop?featured=true' }]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock body scroll when menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: isScrolled || isOpen || mobileSearchOpen ? 'rgba(8, 8, 8, 0.94)' : 'transparent',
        backdropFilter: isScrolled || isOpen || mobileSearchOpen ? 'blur(40px) saturate(130%)' : 'none',
        WebkitBackdropFilter: isScrolled || isOpen || mobileSearchOpen ? 'blur(40px) saturate(130%)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(212, 175, 55, 0.04)' : '1px solid transparent',
      }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-[68px] lg:h-[72px]">
            
            {/* Logo — TIGHT */}
            <Link to="/" className="flex items-center gap-2 no-underline shrink-0 group">
              <svg width="34" height="34" viewBox="0 0 100 100" fill="none" className="shrink-0 transition-transform duration-500 group-hover:scale-110">
                <path d="M10 10 L50 90 L90 10" stroke="#D4AF37" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M25 10 L50 60 L75 10" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
              </svg>
              <div className="flex flex-col -ml-0.5">
                <span className="text-white font-black text-[18px] lg:text-[20px] tracking-[0.35em] leading-none">
                  ELARIO
                </span>
                <span className="text-[#D4AF37] text-[7px] lg:text-[8px] tracking-[0.45em] uppercase mt-0 font-semibold opacity-60">
                  Movement With Style
                </span>
              </div>
            </Link>

            {/* Desktop Center — Search */}
            <div className="hidden lg:flex flex-1 items-center justify-center max-w-lg mx-6">
              <button 
                onClick={openSearch}
                className="w-full flex items-center gap-3 px-5 py-2.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-[#D4AF37]/15 rounded-2xl transition-all duration-500 cursor-pointer group"
              >
                <Search size={14} strokeWidth={1.5} className="text-white/10 group-hover:text-[#D4AF37]/40 transition-colors duration-500" />
                <span className="text-white/10 text-[12px] tracking-wide flex-1 text-left font-light">Search products, categories...</span>
                <span className="px-2 py-1 bg-white/[0.03] rounded-md text-[10px] text-white/10 border border-white/[0.02] font-mono tracking-wider">⌘ K</span>
              </button>
            </div>

            {/* Desktop Right */}
            <div className="hidden lg:flex items-center gap-0">
              {navLinks.map(link => {
                const isActive = location.pathname + location.search === link.path || 
                  (link.path !== '/' && location.search.includes(link.path.split('?')[1]))
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`relative px-3.5 py-2 text-[10px] tracking-[0.22em] font-semibold uppercase transition-all duration-500 rounded-xl no-underline ${
                      isActive 
                        ? 'text-[#D4AF37]' 
                        : 'text-white/25 hover:text-white/60'
                    }`}
                  >
                    {link.name}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-[#D4AF37] rounded-full transition-all duration-500 ease-out ${
                      isActive ? 'w-3 opacity-100' : hoveredLink === link.name ? 'w-1.5 opacity-40' : 'w-0 opacity-0'
                    }`} />
                  </Link>
                )
              })}

              <div className="w-px h-3 bg-white/[0.03] mx-2" />

              <Link 
                to="/wishlist" 
                className="p-2.5 text-white/15 hover:text-[#D4AF37] relative transition-all duration-500 no-underline rounded-xl hover:bg-white/[0.02]"
              >
                <Heart size={17} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-[#D4AF37] text-[#060606] text-[7px] font-black rounded-full flex items-center justify-center px-0.5 ring-2 ring-[#060606]">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link 
                to="/cart" 
                className="p-2.5 text-white/15 hover:text-[#D4AF37] relative transition-all duration-500 no-underline rounded-xl hover:bg-white/[0.02] mr-1"
              >
                <ShoppingBag size={17} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-[#D4AF37] text-[#060606] text-[7px] font-black rounded-full flex items-center justify-center px-0.5 ring-2 ring-[#060606]">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              {user ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-2 pl-1 pr-3 py-1 transition-all duration-500 cursor-pointer rounded-full border ${
                      showUserMenu 
                        ? 'bg-[#D4AF37]/[0.08] border-[#D4AF37]/25 shadow-[0_0_30px_rgba(212,175,55,0.12)]' 
                        : 'bg-white/[0.015] border-white/[0.04] hover:border-[#D4AF37]/15 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#D4AF37]/10 flex items-center justify-center relative overflow-hidden">
                      <div className={`absolute inset-0 bg-[#D4AF37]/8 transition-opacity duration-700 ${showUserMenu ? 'opacity-100' : 'opacity-0'}`} />
                      <User size={13} strokeWidth={1.5} className="text-[#D4AF37] relative z-10" />
                    </div>
                    <span className="text-white/40 text-[11px] font-medium tracking-wide max-w-[60px] truncate">{user.fullName?.split(' ')[0]}</span>
                    <ChevronRight 
                      size={12} 
                      strokeWidth={2} 
                      className={`text-white/20 transition-all duration-500 ${showUserMenu ? 'rotate-90 text-[#D4AF37]/50' : ''}`} 
                    />
                  </button>
                  
                  <div 
                    className={`absolute right-0 top-[calc(100%+14px)] w-[260px] bg-[#0a0a0a] border border-[#D4AF37]/[0.08] rounded-2xl overflow-hidden z-[100] shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.06)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right ${
                      showUserMenu ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="h-[2px] bg-[#D4AF37]/20 w-full" />
                    
                    <div className="p-5">
                      <div className="flex items-center gap-3.5 mb-5">
                        <div className="w-11 h-11 rounded-full bg-[#D4AF37]/[0.06] border border-[#D4AF37]/15 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-[#D4AF37]/[0.04] animate-pulse" />
                          <User size={20} strokeWidth={1.2} className="text-[#D4AF37] relative z-10" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[13px] font-bold tracking-wide">{user.fullName}</p>
                          <p className="text-[#D4AF37]/40 text-[11px] mt-0.5 font-medium">{user.email}</p>
                        </div>
                        {isAdmin && <Crown size={14} className="text-[#D4AF37]/50" strokeWidth={1.5} />}
                      </div>

                      <div className="space-y-0.5">
                        <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/30 no-underline hover:bg-white/[0.02] hover:text-white rounded-xl transition-all duration-500 group">
                          <Heart size={14} strokeWidth={1.5} className="text-white/15 group-hover:text-[#D4AF37]/50 transition-colors duration-500" />
                          <span className="flex-1">Wishlist</span>
                          {wishlistCount > 0 && (
                            <span className="text-[#D4AF37] text-[11px] font-bold bg-[#D4AF37]/[0.06] px-2 py-0.5 rounded-md">{wishlistCount}</span>
                          )}
                        </Link>
                        
                        <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/30 no-underline hover:bg-white/[0.02] hover:text-white rounded-xl transition-all duration-500 group">
                          <Package size={14} strokeWidth={1.5} className="text-white/15 group-hover:text-[#D4AF37]/50 transition-colors duration-500" />
                          <span>Orders</span>
                        </Link>
                        
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#D4AF37]/50 no-underline hover:bg-[#D4AF37]/[0.03] hover:text-[#D4AF37] rounded-xl transition-all duration-500 group">
                            <Crown size={14} strokeWidth={1.5} className="text-[#D4AF37]/30 group-hover:text-[#D4AF37] transition-colors duration-500" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="px-3 pb-3">
                      <button
                        onClick={() => { logout(); navigate('/') }}
                        className="w-full flex items-center gap-3 px-3 py-3 text-[13px] text-red-400/30 hover:text-red-400/70 hover:bg-red-500/[0.03] rounded-xl transition-all duration-500 cursor-pointer bg-transparent border-none group"
                      >
                        <LogOut size={14} strokeWidth={1.5} className="text-red-400/20 group-hover:text-red-400/40 transition-colors duration-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c9a433] text-[#060606] text-[11px] font-black tracking-[0.2em] rounded-xl no-underline transition-all duration-500 ml-2 hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]"
                >
                  SIGN IN
                </Link>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-0">
              <button 
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="p-2.5 text-white/20 hover:text-white/50 transition-all duration-500 bg-transparent border-none cursor-pointer"
              >
                {mobileSearchOpen ? <X size={20} strokeWidth={1.5} /> : <Search size={20} strokeWidth={1.5} />}
              </button>

              <Link 
                to="/cart" 
                className="p-2.5 text-white/20 hover:text-[#D4AF37] relative transition-all no-underline"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-[#D4AF37] text-[#060606] text-[7px] font-black rounded-full flex items-center justify-center px-0.5 ring-2 ring-[#050505]">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 text-white/40 hover:text-white bg-transparent border-none cursor-pointer ml-0.5"
              >
                {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div 
            className={`lg:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              mobileSearchOpen ? 'max-h-20 opacity-100 pb-5' : 'max-h-0 opacity-0'
            }`}
          >
            <form onSubmit={handleMobileSearch} className="relative">
              <Search 
                size={15} 
                strokeWidth={1.5} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" 
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white/[0.015] border border-white/[0.03] rounded-2xl py-3.5 pl-11 pr-12 text-white text-[15px] placeholder:text-white/10 focus:outline-none focus:border-[#D4AF37]/15 focus:bg-white/[0.03] transition-all duration-500"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-[#D4AF37] hover:bg-white/[0.02] rounded-xl transition-all duration-500"
                >
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              )}
            </form>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE MENU — FAST & CLEAN ===== */}
      <div 
        className={`fixed inset-0 z-[45] lg:hidden transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-[#050505]/[0.98] backdrop-blur-[60px]"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#D4AF37]/[0.02] rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative h-full flex flex-col pt-20 pb-10 px-8">
          
          {/* User Card */}
          {user && (
            <div 
              className={`flex items-center gap-4 mb-8 p-4 bg-white/[0.015] rounded-2xl border border-white/[0.03] backdrop-blur-xl transition-all duration-300 ease-out ${
                isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: isOpen ? '50ms' : '0ms' }}
            >
              <div className="w-11 h-11 rounded-full bg-[#D4AF37]/[0.06] border border-[#D4AF37]/15 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[#D4AF37]/[0.04] animate-pulse" />
                <User size={20} strokeWidth={1.2} className="text-[#D4AF37] relative z-10" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold tracking-wide">{user.fullName}</p>
                <p className="text-[#D4AF37]/35 text-[11px] mt-0.5">{user.email}</p>
              </div>
              {isAdmin && <Crown size={16} className="text-[#D4AF37]/40" strokeWidth={1.5} />}
            </div>
          )}

          {/* Nav Links — Quick stagger */}
          <div className="flex-1 flex flex-col justify-center gap-0">
            {navLinks.map((link, index) => {
              const isActive = location.pathname + location.search === link.path
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center justify-between py-4 border-b border-white/[0.02] no-underline transition-colors duration-300 ${
                    isActive ? 'text-[#D4AF37]' : 'text-white/20 hover:text-white/60'
                  }`}
                  style={{ 
                    transitionDelay: isOpen ? `${80 + index * 40}ms` : '0ms',
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
                    transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <span className="text-[26px] font-extralight tracking-[0.2em] uppercase">
                    {link.name}
                  </span>
                  <ArrowRight 
                    size={16} 
                    strokeWidth={1} 
                    className={`transition-all duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-white/5 group-hover:text-white/15 group-hover:translate-x-1'}`} 
                  />
                </Link>
              )
            })}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-between py-4 border-b border-white/[0.02] no-underline text-white/20 hover:text-[#D4AF37] transition-colors duration-300"
              style={{ 
                transitionDelay: isOpen ? `${80 + navLinks.length * 40}ms` : '0ms',
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
                transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <span className="text-[26px] font-extralight tracking-[0.2em] uppercase flex items-center gap-4">
                <Heart size={16} strokeWidth={1.2} className="text-[#D4AF37]/15" />
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="text-[#D4AF37] text-sm font-medium bg-[#D4AF37]/[0.06] px-3 py-1 rounded-lg border border-[#D4AF37]/[0.08]">{wishlistCount}</span>
              )}
            </Link>
          </div>

          {/* Bottom Buttons */}
          <div 
            className={`mt-auto pt-8 space-y-3 transition-all duration-300 ease-out ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: isOpen ? '300ms' : '0ms' }}
          >
            {user ? (
              <div className="grid grid-cols-2 gap-2.5">
                <Link 
                  to="/orders" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 bg-white/[0.015] border border-white/[0.03] rounded-xl text-white/20 text-[13px] no-underline hover:border-white/8 hover:text-white/50 transition-all duration-500"
                >
                  <Package size={14} strokeWidth={1.5} />
                  Orders
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 py-3.5 bg-[#D4AF37]/[0.03] border border-[#D4AF37]/10 rounded-xl text-[#D4AF37]/40 text-[13px] no-underline hover:border-[#D4AF37]/20 hover:text-[#D4AF37] transition-all duration-500 col-span-2"
                  >
                    <Crown size={14} strokeWidth={1.5} />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { logout(); navigate('/'); setIsOpen(false) }}
                  className="col-span-2 flex items-center justify-center gap-2 py-3.5 bg-red-500/[0.03] border border-red-500/8 rounded-xl text-red-400/30 text-[13px] font-medium hover:bg-red-500/6 hover:text-red-400/60 hover:border-red-500/15 transition-all duration-500 cursor-pointer"
                >
                  <LogOut size={14} strokeWidth={1.5} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-4 bg-[#D4AF37] text-[#030303] text-sm font-black tracking-[0.2em] rounded-xl no-underline hover:bg-[#c9a433] transition-all duration-500 shadow-[0_0_50px_rgba(212,175,55,0.15)]"
                >
                  SIGN IN
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-4 border border-white/[0.04] text-white/15 text-sm font-medium tracking-[0.1em] rounded-xl no-underline hover:border-white/10 hover:text-white/40 transition-all duration-500"
                >
                  CREATE ACCOUNT
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}