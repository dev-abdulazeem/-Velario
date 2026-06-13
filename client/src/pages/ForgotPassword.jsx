import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import api from '../api/axios'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-velario-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-velario-gray/80 backdrop-blur-xl border border-white/5 rounded-2xl p-10 shadow-2xl">
          
          {/* Back to login */}
          <Link to="/login" className="inline-flex items-center gap-2 text-white/40 text-sm hover:text-velario-gold transition-colors mb-8">
            <ArrowLeft size={16} />
            Back to login
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
              <p className="text-white/60 text-sm mb-2">We've sent a password reset link to</p>
              <p className="text-velario-gold font-medium mb-6">{email}</p>
              <p className="text-white/40 text-xs">Didn't receive it? Check your spam folder.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-5 bg-velario-gold/10 rounded-2xl flex items-center justify-center">
                  <Mail size={28} className="text-velario-gold" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
                <p className="text-white/40 text-sm">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3.5 bg-velario-black/60 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-velario-gold transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-gold text-velario-black font-bold tracking-widest rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      SENDING...
                    </>
                  ) : (
                    'SEND RESET LINK'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}