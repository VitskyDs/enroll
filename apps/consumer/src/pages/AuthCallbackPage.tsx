import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        navigate('/dashboard', { replace: true })
        return
      }

      const returnUrl = sessionStorage.getItem('enroll_return_url')
      sessionStorage.removeItem('enroll_return_url')

      if (returnUrl) {
        // returnUrl is an absolute URL; extract path+search+hash for client-side navigation
        sessionStorage.removeItem('enroll_business_id')
        try {
          const url = new URL(returnUrl)
          navigate(url.pathname + url.search + url.hash, { replace: true })
        } catch {
          navigate('/dashboard', { replace: true })
        }
      } else {
        const businessId = sessionStorage.getItem('enroll_business_id')
        sessionStorage.removeItem('enroll_business_id')
        if (businessId) {
          navigate(`/dashboard?business=${businessId}`, { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      }
    }

    handleCallback()
  }, [navigate])

  return null
}
