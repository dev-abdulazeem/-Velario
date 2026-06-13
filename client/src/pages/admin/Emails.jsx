import { useEffect, useState } from 'react'
import { Mail, Send, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import api from '../../api/axios'
import AdminLayout from '../../components/admin/AdminLayout'

const statusIcons = {
  sent: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
}

export default function AdminEmails() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/email-logs')
        setLogs(res.data || [])
      } catch (err) {
        console.error('Email logs fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-white text-2xl font-bold mb-1">Email Logs</h2>
        <p className="text-white/40 text-sm">Track email delivery status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#111118] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Send size={20} className="text-green-400" />
            </div>
            <span className="text-white/40 text-sm">Total Sent</span>
          </div>
          <p className="text-white text-2xl font-bold">
            {logs.filter(l => l.status === 'sent').length}
          </p>
        </div>
        <div className="bg-[#111118] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock size={20} className="text-yellow-400" />
            </div>
            <span className="text-white/40 text-sm">Pending</span>
          </div>
          <p className="text-white text-2xl font-bold">
            {logs.filter(l => l.status === 'pending').length}
          </p>
        </div>
        <div className="bg-[#111118] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <span className="text-white/40 text-sm">Failed</span>
          </div>
          <p className="text-white text-2xl font-bold">
            {logs.filter(l => l.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* Email Logs Table */}
      <div className="bg-[#111118] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-white font-bold">Recent Emails</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20">
            <Mail size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No email logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">Recipient</th>
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">Subject</th>
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">Type</th>
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => {
                  const status = statusIcons[log.status] || statusIcons.pending
                  const StatusIcon = status.icon
                  
                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg} w-fit`}>
                          <StatusIcon size={12} className={status.color} />
                          <span className={`text-xs font-medium ${status.color} capitalize`}>{log.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">{log.to_email}</td>
                      <td className="px-6 py-4 text-white text-sm">{log.subject}</td>
                      <td className="px-6 py-4">
                        <span className="text-white/60 text-sm capitalize">{log.type || 'general'}</span>
                      </td>
                      <td className="px-6 py-4 text-white/40 text-sm">
                        {new Date(log.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}