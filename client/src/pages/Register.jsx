import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, CheckCircle, Zap, User, Mail, Lock } from 'lucide-react'
import api from '../api/axios'

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })
      setRegistered(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-velario-black flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-gold rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.3)]">
            <CheckCircle size={40} className="text-velario-black" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">
            CHECK YOUR <span className="text-gradient-gold">EMAIL</span>
          </h2>
          <p className="text-white/50 mb-2">We've sent a verification link to</p>
          <p className="text-velario-gold font-semibold mb-8">{form.email}</p>
          <p className="text-white/30 text-sm mb-8">Please check your inbox and click the link to activate your account.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-gradient-gold text-velario-black font-bold tracking-widest rounded-xl hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(212,175,55,0.3)] transition-all"
          >
            GO TO LOGIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-velario-black flex items-center justify-center relative overflow-hidden p-6">
      {/* Background decorative elements */}
      <div className="absolute top-[5%] right-[10%] w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] animate-float" />
      <div className="absolute bottom-[5%] left-[10%] w-60 h-60 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.04)_0%,transparent_70%)] animate-float-reverse" />

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-velario-gray/80 backdrop-blur-xl border border-white/5 rounded-2xl p-10 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-5 bg-gradient-gold rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.3)]">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                <path d="M10 10 L50 90 L90 10" stroke="#0F0F0F" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white tracking-wide mb-2">
              JOIN <span className="text-gradient-gold">VELARIO</span>
            </h1>
            <p className="text-white/40 text-sm">Create your account and start your journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3.5 bg-velario-black/60 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-velario-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-velario-black/60 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-velario-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full pl-12 pr-12 py-3.5 bg-velario-black/60 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-velario-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repeat password"
                  className="w-full pl-12 pr-4 py-3.5 bg-velario-black/60 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-velario-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-gold text-velario-black font-bold tracking-widest rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-white/50 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-velario-gold font-semibold hover:opacity-80 transition-opacity">
              Sign in
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