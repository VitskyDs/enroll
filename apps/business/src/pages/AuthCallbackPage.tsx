import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      // getSession() picks up the hash tokens (implicit flow) or exchanges the code (PKCE flow)
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        navigate('/', { replace: true })
        return
      }

      const user = session.user

      // Check allowlist
      const { data: allowed } = await supabase
        .from('allowed_emails')
        .select('email')
        .eq('email', user.email)
        .maybeSingle()

      if (!allowed) {
        await supabase.auth.signOut()
        navigate('/', { replace: true, state: { error: "You're not on the access list yet. Reach out to get access." } })
        return
      }

      // Check if user already has a business
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

      navigate(business ? '/dashboard' : '/onboarding', { replace: true })
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" />
        <p className="text-sm text-zinc-500">Signing in…</p>
      </div>
    </div>
  )
}
