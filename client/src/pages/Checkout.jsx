import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Truck, Check, Loader2 } from 'lucide-react'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('paystack')

  const [shipping, setShipping] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  })

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const initializePaystack = async (orderId, total) => {
    setPaymentLoading(true)
    try {
      const res = await api.post('/payments/initialize', {
        email: shipping.email,
        amount: total,
        orderId: orderId,
      })

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url
      } else {
        throw new Error('No authorization URL received')
      }
    } catch (err) {
      console.error('Paystack error:', err.message)
      alert('Failed to initialize payment: ' + err.message)
      setPaymentLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const totalAmount = cartTotal * 1.08

      const res = await api.post('/orders', {
        items: cart.map(item => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: shipping,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
      })

      const order = res.data.order
      setOrderId(order.id)

      if (paymentMethod === 'paystack') {
        await initializePaystack(order.id, totalAmount)
        return
      }

      setOrderPlaced(true)
      clearCart()
    } catch (err) {
      console.error('Place order error:', err.message)
      alert('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="pt-20 min-h-screen bg-velario-black flex items-center justify-center animate-fade-in">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-velario-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-velario-black" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">ORDER CONFIRMED!</h2>
          <p className="text-white/60 mb-2">Thank you for your purchase.</p>
          <p className="text-velario-gold font-bold mb-8">Order #{orderId}</p>
          <p className="text-white/40 text-sm mb-8">A confirmation email has been sent to {shipping.email}</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-8 py-4 bg-gradient-gold text-velario-black text-sm font-bold tracking-wider rounded hover:shadow-lg transition-all"
          >
            VIEW MY ORDERS
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-velario-black animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? 'bg-velario-gold text-velario-black' : 'bg-velario-gray text-white/40'
              }`}>
                {s}
              </div>
              {i < 1 && (
                <div className={`w-24 h-px mx-2 ${step > s ? 'bg-velario-gold' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <>
            <h1 className="text-3xl font-black text-white mb-2">SHIPPING <span className="text-gradient-gold">DETAILS</span></h1>
            <p className="text-white/40 text-sm mb-8">Enter your delivery information</p>

            <form onSubmit={handleShippingSubmit} className="bg-velario-gray rounded-xl p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/60 text-xs tracking-wider mb-2 block">FULL NAME</label>
                  <input
                    type="text"
                    required
                    value={shipping.fullName}
                    onChange={e => setShipping({ ...shipping, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-velario-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-velario-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs tracking-wider mb-2 block">EMAIL</label>
                  <input
                    type="email"
                    required
                    value={shipping.email}
                    onChange={e => setShipping({ ...shipping, email: e.target.value })}
                    className="w-full px-4 py-3 bg-velario-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-velario-gold transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-white/60 text-xs tracking-wider mb-2 block">ADDRESS</label>
                  <input
                    type="text"
                    required
                    value={shipping.address}
                    onChange={e => setShipping({ ...shipping, address: e.target.value })}
                    className="w-full px-4 py-3 bg-velario-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-velario-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs tracking-wider mb-2 block">CITY</label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={e => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full px-4 py-3 bg-velario-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-velario-gold transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-xs tracking-wider mb-2 block">STATE</label>
                    <input
                      type="text"
                      required
                      value={shipping.state}
                      onChange={e => setShipping({ ...shipping, state: e.target.value })}
                      className="w-full px-4 py-3 bg-velario-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-velario-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs tracking-wider mb-2 block">ZIP</label>
                    <input
                      type="text"
                      required
                      value={shipping.zipCode}
                      onChange={e => setShipping({ ...shipping, zipCode: e.target.value })}
                      className="w-full px-4 py-3 bg-velario-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-velario-gold transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-xs tracking-wider mb-2 block">PHONE</label>
                  <input
                    type="tel"
                    required
                    value={shipping.phone}
                    onChange={e => setShipping({ ...shipping, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-velario-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-velario-gold transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="flex items-center gap-2 text-white/40 hover:text-velario-gold transition-colors text-sm"
                >
                  <ArrowLeft size={16} />
                  Back to Cart
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-gold text-velario-black text-sm font-bold tracking-wider rounded-lg hover:shadow-lg transition-all"
                >
                  CONTINUE TO PAYMENT
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black text-white mb-2">PAYMENT <span className="text-gradient-gold">METHOD</span></h1>
            <p className="text-white/40 text-sm mb-8">Choose your payment option</p>

            <div className="bg-velario-gray rounded-xl p-8 space-y-6">
              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod('paystack')}
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'paystack'
                      ? 'border-velario-gold bg-velario-gold/5'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <CreditCard size={24} className={paymentMethod === 'paystack' ? 'text-velario-gold' : 'text-white/40'} />
                  <div className="flex-1">
                    <p className="text-white font-medium">Pay with Card (Paystack)</p>
                    <p className="text-white/40 text-sm">Secure online payment</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    paymentMethod === 'paystack'
                      ? 'border-velario-gold bg-velario-gold'
                      : 'border-white/20'
                  }`} />
                </div>

                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-velario-gold bg-velario-gold/5'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <Truck size={24} className={paymentMethod === 'cod' ? 'text-velario-gold' : 'text-white/40'} />
                  <div className="flex-1">
                    <p className="text-white font-medium">Cash on Delivery</p>
                    <p className="text-white/40 text-sm">Pay when you receive your order</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    paymentMethod === 'cod'
                      ? 'border-velario-gold bg-velario-gold'
                      : 'border-white/20'
                  }`} />
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-white font-bold mb-4">ORDER SUMMARY</h3>
                <div className="space-y-2 mb-4">
                  {cart.map(item => (
                    <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                      <span className="text-white/60">{item.name} (x{item.quantity})</span>
                      <span className="text-white">₦{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white">₦{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Shipping</span>
                    <span className="text-velario-gold">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Tax</span>
                    <span className="text-white">₦{(cartTotal * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span className="text-white">Total</span>
                    <span className="text-velario-gold">₦{(cartTotal * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-white/40 hover:text-velario-gold transition-colors text-sm"
                >
                  <ArrowLeft size={16} />
                  Back to Shipping
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || paymentLoading}
                  className="px-8 py-4 bg-gradient-gold text-velario-black text-sm font-bold tracking-wider rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      REDIRECTING...
                    </>
                  ) : loading ? (
                    'PROCESSING...'
                  ) : (
                    `PAY ₦${(cartTotal * 1.08).toFixed(2)}`
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}