import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, Mail, User, CreditCard, Banknote, X } from 'lucide-react'
import api from '../api/axios'

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'Pending' },
  processing: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-velario-gold', bg: 'bg-velario-gold/10', border: 'border-velario-gold/20', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', label: 'Cancelled' },
}

const paymentStatusConfig = {
  pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Unpaid' },
  paid: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Paid' },
}

const getPayConfig = (paymentStatus) => {
  if (!paymentStatus) return paymentStatusConfig.pending
  return paymentStatusConfig[paymentStatus] || paymentStatusConfig.pending
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders')
        setOrders(res.data)
      } catch (err) {
        console.error('Fetch orders error:', err.message)
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const getProductImage = (product) => {
    if (!product) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80'
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0]
    }
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images)
        return parsed[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80'
      } catch {
        return product.images
      }
    }
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80'
  }

  const getShippingAddress = (order) => {
    if (!order || !order.shipping_address) return null
    if (typeof order.shipping_address === 'string') {
      try {
        return JSON.parse(order.shipping_address)
      } catch {
        return null
      }
    }
    return order.shipping_address
  }

  const getStatusSteps = (currentStatus) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered']
    const currentIndex = steps.indexOf(currentStatus)
    if (currentIndex === -1) {
      return steps.map((step, index) => ({
        status: step,
        completed: false,
        active: index === 0,
      }))
    }
    return steps.map((step, index) => ({
      status: step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }))
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-velario-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-velario-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen bg-velario-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-velario-gold text-velario-black rounded font-bold"
          >
            RETRY
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-velario-black animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-black text-white mb-2">MY <span className="text-gradient-gold">ORDERS</span></h1>
        <p className="text-white/40 text-sm mb-12">Track and manage your purchases</p>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-velario-gray rounded-xl">
            <Package size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No orders yet</p>
            <Link to="/shop" className="text-velario-gold text-sm mt-4 inline-block hover:underline">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const config = statusConfig[order.status] || statusConfig.pending
              const StatusIcon = config.icon

              return (
                <div key={order.id} className="bg-velario-gray rounded-xl overflow-hidden border border-white/5">
                  <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-white/40 text-xs tracking-wider mb-1">ORDER #{order.id}</p>
                      <p className="text-white text-sm">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} border ${config.border}`}>
                        <StatusIcon size={14} className={config.color} />
                        <span className={`text-xs font-bold tracking-wider ${config.color}`}>{config.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {order.items?.slice(0, 2).map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <img
                          src={getProductImage(item.product)}
                          alt={item.product?.name || 'Product'}
                          className="w-16 h-16 object-cover rounded-lg bg-velario-gray-light"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80'
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{item.product?.name || 'Product'}</p>
                          <p className="text-white/40 text-xs">Size: {item.size || 'N/A'} | Qty: {item.quantity || 0}</p>
                        </div>
                        <span className="text-velario-gold font-bold text-sm">
                          ₦{((item.price_at_time || 0) * (item.quantity || 0)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {order.items && order.items.length > 2 && (
                      <p className="text-white/40 text-xs text-center">+{order.items.length - 2} more item(s)</p>
                    )}
                  </div>

                  <div className="p-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-white/40 text-xs">Total</p>
                      <p className="text-velario-gold text-xl font-black">₦{Number(order.total_amount || 0).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="px-6 py-2 border border-white/10 text-white/60 text-xs tracking-wider rounded hover:border-velario-gold hover:text-velario-gold transition-colors"
                    >
                      VIEW DETAILS
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-velario-gray rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 p-6 bg-velario-gray border-b border-white/5 flex items-center justify-between z-10">
              <div>
                <p className="text-white/40 text-xs tracking-wider">ORDER #{selectedOrder.id}</p>
                <p className="text-white font-medium">
                  {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : 'N/A'}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Timeline */}
              <div>
                <h3 className="text-white font-bold text-sm mb-4">ORDER STATUS</h3>
                <div className="flex items-center justify-between">
                  {getStatusSteps(selectedOrder.status).map((step, i) => {
                    const stepConfig = statusConfig[step.status]
                    const StepIcon = stepConfig.icon
                    const isLast = i === 3

                    return (
                      <div key={step.status} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                            step.completed ? 'bg-velario-gold border-velario-gold' : 'bg-transparent border-white/20'
                          }`}>
                            <StepIcon size={16} className={step.completed ? 'text-velario-black' : 'text-white/30'} />
                          </div>
                          <span className={`text-[10px] mt-2 tracking-wider ${
                            step.active ? 'text-velario-gold font-bold' : step.completed ? 'text-white/60' : 'text-white/30'
                          }`}>
                            {stepConfig.label.toUpperCase()}
                          </span>
                        </div>
                        {!isLast && (
                          <div className={`flex-1 h-0.5 mx-2 ${step.completed ? 'bg-velario-gold' : 'bg-white/10'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <CreditCard size={16} className="text-velario-gold" />
                  PAYMENT INFORMATION
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/30 text-[10px] tracking-wider uppercase">Method</p>
                    <p className="text-white text-sm capitalize">{selectedOrder.payment_method || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-[10px] tracking-wider uppercase">Status</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${getPayConfig(selectedOrder.payment_status).bg}`}>
                      {selectedOrder.payment_method === 'paystack' ? 
                        <CreditCard size={10} className={getPayConfig(selectedOrder.payment_status).color} /> : 
                        <Banknote size={10} className={getPayConfig(selectedOrder.payment_status).color} />
                      }
                      <span className={`text-xs font-bold ${getPayConfig(selectedOrder.payment_status).color}`}>
                        {getPayConfig(selectedOrder.payment_status).label}
                      </span>
                    </div>
                  </div>
                  {selectedOrder.payment_ref && (
                    <div className="col-span-2">
                      <p className="text-white/30 text-[10px] tracking-wider uppercase">Reference</p>
                      <p className="text-white/60 text-xs font-mono">{selectedOrder.payment_ref}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Info */}
              {(() => {
                const addr = getShippingAddress(selectedOrder)
                if (!addr) return (
                  <div className="bg-black/20 rounded-xl p-4">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-velario-gold" />
                      SHIPPING ADDRESS
                    </h3>
                    <p className="text-white/40 text-sm">No shipping address available</p>
                  </div>
                )
                return (
                  <div className="bg-black/20 rounded-xl p-4">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-velario-gold" />
                      SHIPPING ADDRESS
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-white/30" />
                        <span className="text-white text-sm">{addr.fullName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-white/30" />
                        <span className="text-white text-sm">{addr.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-white/30" />
                        <span className="text-white text-sm">{addr.phone || 'N/A'}</span>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-white/60 text-sm">{addr.address || 'N/A'}</p>
                        <p className="text-white/60 text-sm">
                          {[addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Order Items */}
              <div>
                <h3 className="text-white font-bold text-sm mb-4">ORDER ITEMS</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                      <img 
                        src={getProductImage(item.product)} 
                        alt={item.product?.name || 'Product'}
                        className="w-16 h-16 rounded-lg object-cover bg-velario-black"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80'
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.product?.name || `Product #${item.product_id}`}</p>
                        <p className="text-white/40 text-xs">Size: {item.size || 'N/A'} | Qty: {item.quantity || 0}</p>
                        <p className="text-white/40 text-xs">₦{Number(item.price_at_time || 0).toLocaleString()} each</p>
                      </div>
                      <span className="text-velario-gold font-bold">
                        ₦{((item.price_at_time || 0) * (item.quantity || 0)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Breakdown */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">₦{Math.round((parseFloat(selectedOrder.total_amount || 0) / 1.075)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Tax (7.5% VAT)</span>
                  <span className="text-white">₦{Math.round((parseFloat(selectedOrder.total_amount || 0) - parseFloat(selectedOrder.total_amount || 0) / 1.075)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Shipping</span>
                  <span className="text-velario-gold">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/5">
                  <span className="text-white">Total</span>
                  <span className="text-velario-gold">₦{Number(parseFloat(selectedOrder.total_amount || 0)).toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Link
                  to="/shop"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-3 bg-gradient-gold text-velario-black text-sm font-bold tracking-wider rounded-lg text-center hover:shadow-lg transition-all"
                >
                  CONTINUE SHOPPING
                </Link>
                {selectedOrder.status === 'delivered' && (
                  <button className="flex-1 py-3 border border-velario-gold text-velario-gold text-sm font-bold tracking-wider rounded-lg hover:bg-velario-gold/10 transition-all">
                    WRITE REVIEW
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}