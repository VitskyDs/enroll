import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Minimal shape — only the fields the consumer app needs
export interface ConsumerLoyaltyProgram {
  id: string
  business_id: string
  program_type: string
  program_name: string
  currency_name: string
  referral_rules: Record<string, unknown>
  earn_rules: Record<string, unknown>
}

interface UseLoyaltyProgramResult {
  program: ConsumerLoyaltyProgram | null
  loading: boolean
  error: string | null
}

/**
 * Fetches the loyalty program for a given business.
 * Falls back to the most recently created program when no businessId is provided
 * (POC convenience — replace with proper auth-based lookup in production).
 */
export function useLoyaltyProgram(businessId?: string): UseLoyaltyProgramResult {
  const [program, setProgram] = useState<ConsumerLoyaltyProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('loyalty_programs')
        .select('id, business_id, program_type, program_name, currency_name, referral_rules, earn_rules')
        // Prefer programs with referral_rules populated, then newest first
        .order('referral_rules', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(1)

      if (businessId) {
        query = query.eq('business_id', businessId)
      }

      const { data, error: err } = await query.single()

      if (cancelled) return
      if (err) {
        setError(err.message)
      } else {
        setProgram(data as ConsumerLoyaltyProgram)
      }
      setLoading(false)
    }

    fetch()
    return () => {
      cancelled = true
    }
  }, [businessId])

  return { program, loading, error }
}
