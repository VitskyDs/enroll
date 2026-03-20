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

      const businessId = sessionStorage.getItem('enroll_business_id')
      sessionStorage.removeItem('enroll_business_id')

      if (businessId) {
        navigate(`/dashboard?business=${businessId}`, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return null
}
