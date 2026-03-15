import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface ConsumerService {
  id: string
  name: string
  description: string | null
  price_cents: number | null
  subscription_price_cents: number | null
  duration_minutes: number | null
  image_url: string | null
}

interface UseServicesResult {
  services: ConsumerService[]
  loading: boolean
  error: string | null
}

/**
 * Fetches services for a given business.
 * Returns all non-inactive services. Falls back to most recent business
 * when no businessId is provided (POC convenience).
 */
export function useServices(businessId?: string): UseServicesResult {
  const [services, setServices] = useState<ConsumerService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      if (!businessId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('services')
        .select('id, name, description, price_cents, subscription_price_cents, duration_minutes, image_url')
        .eq('business_id', businessId)
        .neq('status', 'archived')
        .order('created_at', { ascending: true })

      if (cancelled) return
      if (err) {
        setError(err.message)
      } else {
        setServices((data ?? []) as ConsumerService[])
      }
      setLoading(false)
    }

    fetch()
    return () => {
      cancelled = true
    }
  }, [businessId])

  return { services, loading, error }
}
