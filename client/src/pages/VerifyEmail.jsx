import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import api from '../api/axios'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying')
  
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    const verify = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`)
        setStatus('success')
        setTimeout(() => navigate('/login'), 3000)
      } catch (err) {
        console.error('Email verify error:', err.message)
        setStatus('error')
      }
    }

    verify()
  }, [token, navigate])

  return (
    <div className="pt-20 min-h-screen bg-velario-black flex items-center justify-center animate-fade-in">
      <div className="text-center max-w-md px-4">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 border-2 border-velario-gold border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Verifying...</h2>
            <p className="text-white/40">Please wait while we verify your email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={64} className="text-velario-gold mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white mb-4">EMAIL VERIFIED!</h2>
            <p className="text-white/60 mb-2">Your account is now active.</p>
            <p className="text-white/40 text-sm">Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={64} className="text-red-400 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white mb-4">VERIFICATION FAILED</h2>
            <p className="text-white/60 mb-8">The link is invalid or has expired.</p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-gold text-velario-black text-sm font-bold tracking-wider rounded-lg hover:shadow-lg transition-all"
            >
              REGISTER AGAIN
            </button>
          </>
        )}
      </div>
    </div>
  )
}