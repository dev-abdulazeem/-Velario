import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Users } from 'lucide-react'
import api from '../../api/axios'
import AdminLayout from '../../components/admin/AdminLayout'

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-[#111118] rounded-2xl p-6 border border-white/5">
    <div className={`p-3 rounded-xl ${color} w-fit mb-4`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="text-white/40 text-sm mb-1">{title}</p>
    <p className="text-white text-2xl font-bold">{value}</p>
  </div>
)

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics')
        setData(res.data)
      } catch (err) {
        console.error('Analytics fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
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

  const { dailySales, categorySales, topProducts, monthlyStats } = data || {}

  const totalRevenue = dailySales?.reduce((sum, d) => sum + parseFloat(d.revenue), 0) || 0
  const totalOrders = dailySales?.reduce((sum, d) => sum + parseInt(d.orders), 0) || 0

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-white text-2xl font-bold mb-1">Analytics</h2>
        <p className="text-white/40 text-sm">Store performance insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="30-Day Revenue" value={`₦${totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-green-500/20" />
        <StatCard title="30-Day Orders" value={totalOrders} icon={ShoppingBag} color="bg-blue-500/20" />
        <StatCard title="Categories" value={categorySales?.length || 0} icon={Package} color="bg-purple-500/20" />
        <StatCard title="Top Products" value={topProducts?.length || 0} icon={Users} color="bg-orange-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111118] rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-bold mb-6">Daily Sales (Last 30 Days)</h3>
          <div className="space-y-3">
            {dailySales?.map((day, i) => {
              const maxRevenue = Math.max(...dailySales.map(d => parseFloat(d.revenue)))
              const percentage = maxRevenue > 0 ? (parseFloat(day.revenue) / maxRevenue) * 100 : 0
              
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-white/40 text-xs w-16">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E8C547] rounded-lg transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-white text-xs w-20 text-right">₦{parseFloat(day.revenue).toLocaleString()}</span>
                </div>
              )
            })}
            {(!dailySales || dailySales.length === 0) && (
              <p className="text-white/40 text-center py-8">No sales data available</p>
            )}
          </div>
        </div>

        <div className="bg-[#111118] rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-bold mb-6">Sales by Category</h3>
          <div className="space-y-4">
            {categorySales?.map((cat, i) => {
              const maxRevenue = Math.max(...categorySales.map(c => parseFloat(c.revenue)))
              const percentage = maxRevenue > 0 ? (parseFloat(cat.revenue) / maxRevenue) * 100 : 0
              
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium capitalize">{cat.category}</span>
                    <span className="text-[#D4AF37] text-sm">₦{parseFloat(cat.revenue).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-white/40 text-xs mt-1">{cat.items_sold} items sold</p>
                </div>
              )
            })}
            {(!categorySales || categorySales.length === 0) && (
              <p className="text-white/40 text-center py-8">No category data available</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#111118] rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-bold mb-6">Top Selling Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProducts?.map((product, i) => (
              <div key={i} className="bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                    <Package size={20} className="text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                    <p className="text-white/40 text-xs capitalize">{product.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[#D4AF37] text-sm font-bold">{product.total_quantity}</p>
                    <p className="text-white/40 text-[10px]">Sold</p>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{product.times_sold}</p>
                    <p className="text-white/40 text-[10px]">Orders</p>
                  </div>
                  <div>
                    <p className="text-green-400 text-sm font-bold">₦{parseFloat(product.revenue).toLocaleString()}</p>
                    <p className="text-white/40 text-[10px]">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && (
              <p className="text-white/40 text-center py-8 col-span-full">No product sales data</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}