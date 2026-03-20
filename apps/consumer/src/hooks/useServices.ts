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

interface ServiceRow {
  id: string
  name: string
  description: string | null
  price_cents: number | null
  subscription_price_cents: number | null
  duration_minutes: number | null
  image_url: string | null
  service_images: { url: string; sort_order: number }[]
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
        .select('id, name, description, price_cents, subscription_price_cents, duration_minutes, image_url, service_images(url, sort_order)')
        .eq('business_id', businessId)
        .neq('status', 'archived')
        .order('created_at', { ascending: true })

      if (cancelled) return
      if (err) {
        setError(err.message)
      } else {
        const mapped: ConsumerService[] = (data ?? []).map((row) => {
          const r = row as unknown as ServiceRow
          const primaryImage = r.image_url
            ?? r.service_images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url
            ?? null
          return {
            id: r.id,
            name: r.name,
            description: r.description,
            price_cents: r.price_cents,
            subscription_price_cents: r.subscription_price_cents,
            duration_minutes: r.duration_minutes,
            image_url: primaryImage,
          }
        })
        setServices(mapped)
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
