import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Smooth scroll to top with easing
    const scrollToTop = () => {
      const currentScroll = window.scrollY
      if (currentScroll > 0) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
    }

    // Small delay to let route transition start
    const timeout = setTimeout(scrollToTop, 50)
    return () => clearTimeout(timeout)
  }, [pathname])

  return null
}