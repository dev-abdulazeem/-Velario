import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react'
import { useState } from 'react'
import api from '../api/axios'

// Social Icon SVGs
const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TwitterIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const YoutubeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setLoading(true)
    try {
      await api.post('/email/subscribe', { email })
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 4000)
    } catch (err) {
      console.error('Subscribe error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()

  const SOCIAL_LINKS = {
    instagram: 'https://instagram.com/yourhandle',
    facebook: 'https://facebook.com/yourpage',
    twitter: 'https://twitter.com/yourhandle',
    youtube: 'https://youtube.com/@yourchannel',
  }

  const features = [
    { icon: '✦', title: 'PREMIUM QUALITY', desc: 'Finest materials for lasting comfort.' },
    { icon: '⚡', title: 'LIGHTWEIGHT', desc: 'Designed to keep you moving effortlessly.' },
    { icon: '◈', title: 'DURABLE DESIGN', desc: 'Built to perform, made to last.' },
    { icon: '◉', title: 'FAST DELIVERY', desc: 'Quick and secure delivery to your doorstep.' },
  ]

  return (
    <footer className="bg-[#0F0F0F] border-t border-white/5">
      {/* Features Bar */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-[#D4AF37] text-2xl mb-3">{feature.icon}</div>
                <h4 className="text-white text-xs font-bold tracking-[0.15em] mb-2">{feature.title}</h4>
                <p className="text-white/40 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                <path d="M10 10 L50 90 L90 10" stroke="#D4AF37" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M25 10 L50 60 L75 10" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.3"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-white font-extrabold text-lg tracking-[0.2em]">VELARIO</span>
                <span className="text-[#D4AF37] text-[8px] tracking-[0.3em] uppercase">Movement With Style</span>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
              Velario is more than footwear. It's a statement of who you are and how you move.
            </p>

            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#D4AF37]" />
                <span className="text-white/40 text-sm">Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#D4AF37]" />
                <span className="text-white/40 text-sm">+234 913 993 0978</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#D4AF37]" />
                <span className="text-white/40 text-sm">hello@velario.com</span>
              </div>
            </div>

            <div className="flex gap-3">
              {[
                { icon: InstagramIcon, label: 'Instagram', href: SOCIAL_LINKS.instagram },
                { icon: FacebookIcon, label: 'Facebook', href: SOCIAL_LINKS.facebook },
                { icon: TwitterIcon, label: 'Twitter', href: SOCIAL_LINKS.twitter },
                { icon: YoutubeIcon, label: 'YouTube', href: SOCIAL_LINKS.youtube },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                  aria-label={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h4 className="text-white text-xs font-bold tracking-[0.15em] mb-5">SHOP</h4>
              <div className="space-y-3">
                <Link to="/shop" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">All Products</Link>
                <Link to="/shop?sort=newest" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">New Arrivals</Link>
                <Link to="/shop?sort=bestselling" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">Best Sellers</Link>
                <Link to="/shop?filter=sale" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">Sale</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold tracking-[0.15em] mb-5">COMPANY</h4>
              <div className="space-y-3">
                <Link to="/about" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">About Us</Link>
                <Link to="/about#story" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">Our Story</Link>
                <Link to="/contact" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">Contact</Link>
                <Link to="/contact?tab=careers" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">Careers</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold tracking-[0.15em] mb-5">SUPPORT</h4>
              <div className="space-y-3">
                <Link to="/faqs" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">FAQs</Link>
                <Link to="/shipping" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">Shipping</Link>
                <Link to="/returns" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">Returns</Link>
                <Link to="/size-guide" className="block text-white/40 text-sm hover:text-[#D4AF37] transition-colors">Size Guide</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 pt-12 border-t border-white/5">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h4 className="text-white text-lg font-bold mb-2">SUBSCRIBE</h4>
              <p className="text-white/40 text-sm">Get the latest updates and exclusive offers.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-3.5 bg-[#1A1A1A] border border-white/10 border-r-0 rounded-l-lg text-white text-sm outline-none focus:border-[#D4AF37]/30"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0F0F0F] rounded-r-lg disabled:opacity-60 flex items-center"
              >
                <ArrowRight size={18} />
              </button>
            </form>
            {subscribed && (
              <p className="text-[#D4AF37] text-sm">Thanks for subscribing!</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col items-center gap-4">
          <p className="text-white/30 text-xs">© {currentYear} Velario. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-white/30 text-xs hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-white/30 text-xs hover:text-white/60 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}