import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart()
  const navigate = useNavigate()

  if (cart.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-velario-black flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <ShoppingBag size={64} className="text-white/10 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Your Cart is Empty</h2>
          <p className="text-white/40 mb-8">Discover our collection and find your perfect pair.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-gold text-velario-black text-sm font-bold tracking-wider rounded hover:shadow-lg transition-all"
          >
            START SHOPPING
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-velario-black animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-black text-white mb-2">SHOPPING <span className="text-gradient-gold">BAG</span></h1>
        <p className="text-white/40 text-sm mb-12">{cart.length} items</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item, i) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex gap-6 bg-velario-gray rounded-xl p-4 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg bg-velario-gray-light"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-white/40 text-sm">Size: {item.size}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId, item.size)}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-white hover:border-velario-gold transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-white font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-white hover:border-velario-gold transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-velario-gold font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-velario-gray rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-6">ORDER SUMMARY</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">₦{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Shipping</span>
                  <span className="text-velario-gold">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Tax</span>
                  <span className="text-white">₦{(cartTotal * 0.075).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-velario-gold text-xl font-black">₦{(cartTotal * 1.075).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-gold text-velario-black text-sm font-bold tracking-wider rounded-lg hover:shadow-xl hover:shadow-velario-gold/30 transition-all"
              >
                PROCEED TO CHECKOUT
                <ArrowRight size={16} />
              </button>

              <Link
                to="/shop"
                className="block w-full text-center py-3 text-white/40 text-sm hover:text-velario-gold transition-colors mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}