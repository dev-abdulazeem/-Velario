import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import api from '../api/axios'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contact', form)
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSent(false), 5000)
    } catch (err) {
      console.error('Contact error:', err.message)
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-velario-black pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-white text-4xl font-black mb-2">Contact Us</h1>
        <p className="text-white/40 text-sm mb-12">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-velario-gold/10 flex items-center justify-center">
                <Mail size={18} className="text-velario-gold" />
              </div>
              <div>
                <p className="text-white/30 text-xs">Email</p>
                <p className="text-white text-sm">hello@velario.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-velario-gold/10 flex items-center justify-center">
                <Phone size={18} className="text-velario-gold" />
              </div>
              <div>
                <p className="text-white/30 text-xs">Phone</p>
                <p className="text-white text-sm">+234 800 000 0000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-velario-gold/10 flex items-center justify-center">
                <MapPin size={18} className="text-velario-gold" />
              </div>
              <div>
                <p className="text-white/30 text-xs">Address</p>
                <p className="text-white text-sm">Lagos, Nigeria</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-velario-gray p-8 rounded-2xl border border-white/5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  placeholder="Your name" 
                  required 
                  className="w-full px-4 py-3 bg-velario-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-velario-gold"
                />
              </div>
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  placeholder="your@email.com" 
                  required 
                  className="w-full px-4 py-3 bg-velario-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-velario-gold"
                />
              </div>
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Subject</label>
                <input 
                  type="text" 
                  value={form.subject} 
                  onChange={e => setForm({...form, subject: e.target.value})} 
                  placeholder="How can we help?" 
                  required 
                  className="w-full px-4 py-3 bg-velario-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-velario-gold"
                />
              </div>
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Message</label>
                <textarea 
                  value={form.message} 
                  onChange={e => setForm({...form, message: e.target.value})} 
                  placeholder="Tell us more..." 
                  required 
                  rows={5} 
                  className="w-full px-4 py-3 bg-velario-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-velario-gold resize-y min-h-[120px]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-gold text-velario-black text-sm font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={16} />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              {sent && (
                <p className="text-velario-gold text-sm text-center">
                  Message sent! We'll get back to you soon.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}