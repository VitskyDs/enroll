import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface ConsumerBusiness {
  id: string
  name: string
  industry: string | null
  tagline: string | null
  hours: string | null
  address: string | null
  website_url: string | null
}

interface UseBusinessResult {
  business: ConsumerBusiness | null
  loading: boolean
  error: string | null
}

/**
 * Fetches the business profile for a given business id.
 * Falls back to the most recently created business when no id is provided
 * (POC convenience — replace with proper auth-based lookup in production).
 */
export function useBusiness(businessId?: string): UseBusinessResult {
  const [business, setBusiness] = useState<ConsumerBusiness | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('businesses')
        .select('id, name, industry, tagline, hours, address, website_url')
        .order('created_at', { ascending: false })
        .limit(1)

      if (businessId) {
        query = query.eq('id', businessId)
      }

      const { data, error: err } = await query.single()

      if (cancelled) return
      if (err) {
        setError(err.message)
      } else {
        setBusiness(data as ConsumerBusiness)
      }
      setLoading(false)
    }

    fetch()
    return () => {
      cancelled = true
    }
  }, [businessId])

  return { business, loading, error }
}
