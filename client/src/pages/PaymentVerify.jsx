import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePaystack } from '../hooks/usePaystack'

export default function PaymentVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { verifyPayment } = usePaystack()
  const [status, setStatus] = useState('verifying')

  const reference = searchParams.get('reference')
  const trxref = searchParams.get('trxref')

  useEffect(() => {
    const ref = reference || trxref
    if (!ref || !token) {
      setStatus('failed')
      return
    }

    verifyPayment(ref, token)
      .then(data => {
        setStatus(data.status === 'success' ? 'success' : 'failed')
      })
      .catch(() => setStatus('failed'))
  }, [reference, trxref, token, verifyPayment])

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-velario-black flex flex-col items-center justify-center gap-4">
        <Loader2 size={48} className="text-velario-gold animate-spin" />
        <p className="text-white text-lg">Verifying payment...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-velario-black flex flex-col items-center justify-center gap-6 p-6">
        <CheckCircle size={64} className="text-green-500" />
        <h1 className="text-white text-3xl font-bold">Payment Successful!</h1>
        <p className="text-white/60 text-center">Your order has been confirmed and is being processed.</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-8 py-3.5 bg-gradient-gold text-velario-black font-bold tracking-widest rounded-lg hover:shadow-lg transition-all"
        >
          VIEW ORDERS
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-velario-black flex flex-col items-center justify-center gap-6 p-6">
      <XCircle size={64} className="text-red-500" />
      <h1 className="text-white text-3xl font-bold">Payment Failed</h1>
      <p className="text-white/60 text-center">We couldn't verify your payment. Please try again or contact support.</p>
      <button
        onClick={() => navigate('/cart')}
        className="px-8 py-3.5 border border-velario-gold text-velario-gold font-bold tracking-widest rounded-lg hover:bg-velario-gold/10 transition-all"
      >
        BACK TO CART
      </button>
    </div>
  )
}