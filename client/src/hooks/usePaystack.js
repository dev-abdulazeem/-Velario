import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function usePaystack() {
  const [loading, setLoading] = useState(false)

  const initializePayment = async (email, amount, orderId, token) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, amount, orderId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Redirect to Paystack checkout
      window.location.href = data.authorization_url
      return data
    } catch (err) {
      console.error('Payment init error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyPayment = async (reference, token) => {
    try {
      const res = await fetch(`${API_URL}/payments/verify/${reference}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return await res.json()
    } catch (err) {
      console.error('Payment verify error:', err)
      throw err
    }
  }

  return { initializePayment, verifyPayment, loading }
}