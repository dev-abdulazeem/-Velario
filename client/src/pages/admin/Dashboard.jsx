import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package, 
  ArrowUpRight, ArrowDownRight, Activity, Calendar 
} from 'lucide-react'
import api from '../../api/axios'
import AdminLayout from '../../components/admin/AdminLayout'

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div className="bg-[#111118] rounded-2xl p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${changeType === 'up' ? 'text-green-400' : 'text-red-400'}`}>
        {changeType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}%
      </div>
    </div>
    <p className="text-white/40 text-sm mb-1">{title}</p>
    <p className="text-white text-2xl font-bold">{value}</p>
  </div>
)

const RecentOrderRow = ({ order }) => {
  const statusColors = {
    pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    processing: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    shipped: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20',
    delivered: 'bg-green-400/10 text-green-400 border-green-400/20',
    cancelled: 'bg-red-400/10 text-red-400 border-red-400/20',
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          <ShoppingBag size={18} className="text-white/40" />
        </div>
        <div>
          <p className="text-white text-sm font-medium">Order #{order.id}</p>
          <p className="text-white/40 text-xs">{order.full_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-white/60 text-sm">₦{Number(order.total_amount).toLocaleString()}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status] || statusColors.pending}`}>
          {order.status}
        </span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard')
        setStats(res.data)
      } catch (err) {
        console.error('Dashboard fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  const { stats: numbers, recentOrders, lowStock } = stats || {}

  return (
    <AdminLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-white text-2xl font-bold mb-1">Welcome back, Admin</h2>
        <p className="text-white/40 text-sm">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`₦${Number(numbers?.totalRevenue || 0).toLocaleString()}`}
          change="12.5"
          changeType="up"
          icon={DollarSign}
          color="bg-green-500/20"
        />
        <StatCard 
          title="Total Orders" 
          value={numbers?.totalOrders || 0}
          change="8.2"
          changeType="up"
          icon={ShoppingBag}
          color="bg-blue-500/20"
        />
        <StatCard 
          title="Total Products" 
          value={numbers?.totalProducts || 0}
          change="2.1"
          changeType="down"
          icon={Package}
          color="bg-purple-500/20"
        />
        <StatCard 
          title="Total Customers" 
          value={numbers?.totalUsers || 0}
          change="15.3"
          changeType="up"
          icon={Users}
          color="bg-orange-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#111118] rounded-2xl border border-white/5">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold">Recent Orders</h3>
              <p className="text-white/40 text-xs mt-1">You have {recentOrders?.length || 0} new orders today</p>
            </div>
            <Link to="/admin/orders" className="text-[#D4AF37] text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="p-2">
            {recentOrders?.slice(0, 5).map(order => (
              <RecentOrderRow key={order.id} order={order} />
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <p className="text-white/40 text-sm text-center py-8">No recent orders</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-[#111118] rounded-2xl border border-white/5">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Activity size={18} className="text-red-400" />
              Low Stock Alert
            </h3>
            <p className="text-white/40 text-xs mt-1">Items running low on inventory</p>
          </div>
          <div className="p-4 space-y-3">
            {lowStock?.slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                  <Package size={18} className="text-white/30" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{product.name}</p>
                  <p className="text-red-400 text-xs">{product.stock_quantity} left in stock</p>
                </div>
                <Link 
                  to="/admin/products" 
                  className="text-[#D4AF37] text-xs hover:underline"
                >
                  Restock
                </Link>
              </div>
            ))}
            {(!lowStock || lowStock.length === 0) && (
              <p className="text-white/40 text-sm text-center py-8">All items well stocked</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/admin/products"
          className="bg-[#111118] rounded-2xl p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
            <Package size={24} className="text-[#D4AF37]" />
          </div>
          <h3 className="text-white font-bold mb-1">Manage Products</h3>
          <p className="text-white/40 text-sm">Add, edit, or remove products from your catalog</p>
        </Link>
        <Link 
          to="/admin/orders"
          className="bg-[#111118] rounded-2xl p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
            <ShoppingBag size={24} className="text-blue-400" />
          </div>
          <h3 className="text-white font-bold mb-1">Process Orders</h3>
          <p className="text-white/40 text-sm">View and update order statuses for customers</p>
        </Link>
        <Link 
          to="/admin/analytics"
          className="bg-[#111118] rounded-2xl p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
            <TrendingUp size={24} className="text-purple-400" />
          </div>
          <h3 className="text-white font-bold mb-1">View Analytics</h3>
          <p className="text-white/40 text-sm">Track sales, revenue, and customer insights</p>
        </Link>
      </div>
    </AdminLayout>
  )
}