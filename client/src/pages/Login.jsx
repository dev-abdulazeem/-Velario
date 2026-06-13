import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-velario-black flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] animate-float" />
      <div className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.05)_0%,transparent_70%)] animate-float-reverse" />
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-velario-gray/80 backdrop-blur-xl border border-white/5 rounded-2xl p-12 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-5 bg-gradient-gold rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.3)]">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                <path d="M10 10 L50 90 L90 10" stroke="#0F0F0F" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white tracking-wide mb-2">
              WELCOME <span className="text-gradient-gold">BACK</span>
            </h1>
            <p className="text-white/40 text-sm">Sign in to continue your journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 bg-velario-black/60 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-velario-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all"
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 bg-velario-black/60 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-velario-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-velario-gold"
                />
                <span className="text-white/50 text-sm">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-velario-gold text-sm hover:opacity-80 transition-opacity">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-gold text-velario-black text-sm font-bold tracking-widest rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-white/50 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-velario-gold font-semibold hover:opacity-80 transition-opacity">
              Create one
            </Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-white/30 text-sm inline-flex items-center gap-1.5 hover:text-white/60 transition-colors">
            <Zap size={14} />
            Back to Velario
          </Link>
        </div>
      </div>
    </div>
  )
}