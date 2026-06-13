import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck, CheckCircle, Clock, Package, XCircle, MapPin, Phone, Mail, User, CreditCard, Banknote, Printer, Download, ChevronDown, ChevronUp, ImageOff } from 'lucide-react'
import api from '../../api/axios'
import AdminLayout from '../../components/admin/AdminLayout'

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

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

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = filter ? `?status=${filter}` : ''
      const res = await api.get(`/admin/orders${params}`)
      setOrders(res.data)
    } catch (err) {
      console.error('Fetch orders error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await api.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        trackingNumber: `VEL-${orderId}-TRK`,
      })
      fetchOrders()
    } catch (err) {
      console.error('Update status error:', err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const getProductImage = (product) => {
    if (!product) return null
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0]
    }
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images)
        return parsed[0] || null
      } catch {
        return product.images
      }
    }
    return null
  }

  const printOrder = (order) => {
    window.print()
  }

  return (
    <AdminLayout>
      <div className="pt-20 min-h-screen bg-velario-black animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <div>
              <h1 className="text-3xl font-black text-white">MANAGE <span className="text-gradient-gold">ORDERS</span></h1>
              <p className="text-white/40 text-sm mt-1">{orders.length} orders</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('')}
                className={`px-4 py-2 text-xs tracking-wider rounded-full border transition-all ${
                  !filter ? 'bg-velario-gold text-velario-black border-velario-gold' : 'text-white/60 border-white/10 hover:border-velario-gold'
                }`}
              >
                ALL
              </button>
              {statusOptions.map(status => {
                const config = statusConfig[status]
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 text-xs tracking-wider rounded-full border transition-all ${
                      filter === status ? 'bg-velario-gold text-velario-black border-velario-gold' : 'text-white/60 border-white/10 hover:border-velario-gold'
                    }`}
                  >
                    {config.label.toUpperCase()}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-2 border-velario-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-velario-gray rounded-xl">
                <Package size={48} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/40">No orders found</p>
              </div>
            ) : (
              orders.map(order => {
                const config = statusConfig[order.status]
                const StatusIcon = config.icon
                const payConfig = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending
                const isExpanded = expandedOrder === order.id

                return (
                  <div key={order.id} className="bg-velario-gray rounded-xl overflow-hidden border border-white/5">
                    {/* Order Header - Always Visible */}
                    <div 
                      className="p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6 flex-wrap">
                          {/* Order ID & Date */}
                          <div>
                            <p className="text-white/40 text-xs tracking-wider">ORDER #{order.id}</p>
                            <p className="text-white/40 text-xs">
                              {new Date(order.created_at).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}>
                            <StatusIcon size={14} className={config.color} />
                            <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
                          </div>

                          {/* Payment Status */}
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${payConfig.bg}`}>
                            {order.payment_method === 'paystack' ? <CreditCard size={12} className={payConfig.color} /> : <Banknote size={12} className={payConfig.color} />}
                            <span className={`text-xs font-bold ${payConfig.color}`}>{payConfig.label}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-velario-gold text-xl font-black">₦{Number(order.total_amount).toLocaleString()}</p>
                          <p className="text-white/40 text-xs">{order.items?.length || 0} item(s)</p>
                        </div>
                      </div>

                      {/* Customer Preview */}
                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5 flex-wrap">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-white/30" />
                          <span className="text-white/60 text-sm">{order.ship_full_name || order.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-white/30" />
                          <span className="text-white/60 text-sm">{order.ship_email || order.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-white/30" />
                          <span className="text-white/60 text-sm">{order.ship_phone || 'N/A'}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                          <span className="text-white/40 text-xs">{isExpanded ? 'Collapse' : 'Expand'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Production Details */}
                    {isExpanded && (
                      <div className="border-t border-white/5">
                        {/* Production Card - What to make */}
                        <div className="p-6 bg-gradient-to-r from-velario-gold/5 to-transparent border-b border-white/5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-velario-gold font-bold text-sm flex items-center gap-2">
                              <Package size={16} />
                              PRODUCTION LIST
                            </h3>
                            <button 
                              onClick={(e) => { e.stopPropagation(); printOrder(order) }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-white/60 text-xs hover:bg-white/10 transition-colors"
                            >
                              <Printer size={14} />
                              Print
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {order.items?.map((item, i) => {
                              const imageUrl = getProductImage(item.product)
                              return (
                                <div key={i} className="bg-black/20 rounded-xl p-4 border border-white/5">
                                  <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-velario-black flex-shrink-0">
                                      {imageUrl ? (
                                        <img 
                                          src={imageUrl} 
                                          alt={item.product?.name || 'Product'}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.target.style.display = 'none'
                                            e.target.nextSibling.style.display = 'flex'
                                          }}
                                        />
                                      ) : null}
                                      <div className={`w-full h-full items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}>
                                        <ImageOff size={24} className="text-white/20" />
                                      </div>
                                    </div>
                                    
                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-bold text-sm truncate">
                                        {item.product?.name || `Product #${item.product_id}`}
                                      </p>
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-white/30 text-[10px] uppercase tracking-wider">Size</span>
                                          <span className="text-velario-gold font-bold text-sm">{item.size || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-white/30 text-[10px] uppercase tracking-wider">Qty</span>
                                          <span className="text-white font-bold text-sm">{item.quantity}x</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-white/30 text-[10px] uppercase tracking-wider">Price</span>
                                          <span className="text-white/60 text-sm">₦{item.price_at_time?.toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Production Notes */}
                                  <div className="mt-3 pt-3 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-white/30 text-[10px] uppercase tracking-wider">Product ID</span>
                                      <span className="text-white/60 text-xs font-mono">#{item.product_id}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-white/30 text-[10px] uppercase tracking-wider">Item Total</span>
                                      <span className="text-velario-gold font-bold text-sm">₦{(item.price_at_time * item.quantity).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="p-6 bg-black/20 border-b border-white/5">
                          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-velario-gold" />
                            DELIVERY INFORMATION
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <p className="text-white/30 text-[10px] tracking-wider uppercase">Customer</p>
                                <p className="text-white text-sm">{order.ship_full_name || order.full_name}</p>
                              </div>
                              <div>
                                <p className="text-white/30 text-[10px] tracking-wider uppercase">Email</p>
                                <p className="text-white text-sm">{order.ship_email || order.email}</p>
                              </div>
                              <div>
                                <p className="text-white/30 text-[10px] tracking-wider uppercase">Phone</p>
                                <p className="text-white text-sm">{order.ship_phone || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-white/30 text-[10px] tracking-wider uppercase">Address</p>
                                <p className="text-white text-sm">{order.ship_address || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-white/30 text-[10px] tracking-wider uppercase">City / State / ZIP</p>
                                <p className="text-white text-sm">
                                  {[order.ship_city, order.ship_state, order.ship_zip].filter(Boolean).join(', ') || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-white/30 text-[10px] tracking-wider uppercase">Payment Method</p>
                                <p className="text-white text-sm capitalize">{order.payment_method || 'N/A'} {order.payment_ref && `(Ref: ${order.payment_ref})`}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Summary & Actions */}
                        <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white/40 text-xs">Update Status:</span>
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              disabled={updatingId === order.id}
                              className="bg-velario-black border border-white/10 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-velario-gold"
                            >
                              {statusOptions.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                            {updatingId === order.id && (
                              <div className="w-4 h-4 border border-velario-gold border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-white/40 text-xs">Total: <span className="text-velario-gold font-bold">₦{Number(order.total_amount).toLocaleString()}</span></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}