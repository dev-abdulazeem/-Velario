import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Lock, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import api from '../api/axios'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-velario-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-velario-gray/80 backdrop-blur-xl border border-white/5 rounded-2xl p-10 shadow-2xl">
          
          <Link to="/login" className="inline-flex items-center gap-2 text-white/40 text-sm hover:text-velario-gold transition-colors mb-8">
            <ArrowLeft size={16} />
            Back to login
          </Link>

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Password Reset!</h2>
              <p className="text-white/60 mb-2">Your password has been updated.</p>
              <p className="text-white/40 text-sm">Redirecting to login...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-5 bg-velario-gold/10 rounded-2xl flex items-center justify-center">
                  <Lock size={28} className="text-velario-gold" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">New Password</h1>
                <p className="text-white/40 text-sm">Enter your new password below.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3.5 bg-velario-black/60 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-velario-gold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
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
                      RESETTING...
                    </>
                  ) : (
                    'RESET PASSWORD'
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