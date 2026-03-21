import { createContext, useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface EnrolledCustomer {
  id: string
  points: number
}

interface AuthContextValue {
  user: User | null
  businessId: string | undefined
  enrolledCustomer: EnrolledCustomer | null
  isEnrolled: boolean
  setEnrolledCustomer: (customer: EnrolledCustomer | null) => void
  setBusinessId: (id: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams()
  const urlBusinessId = searchParams.get('business') ?? undefined

  const [user, setUser] = useState<User | null>(null)
  const [businessId, setBusinessId] = useState<string | undefined>(urlBusinessId)
  const [enrolledCustomer, setEnrolledCustomer] = useState<EnrolledCustomer | null>(null)

  // Keep businessId in sync with URL when the param is present
  useEffect(() => {
    if (urlBusinessId) setBusinessId(urlBusinessId)
  }, [urlBusinessId])

  // Initialise auth session and subscribe to changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) setEnrolledCustomer(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Check enrollment whenever the user or businessId changes.
  // Only sets enrolledCustomer when a record is found — never clears it here,
  // so a just-created customer (set by DashboardPage) is not clobbered by a
  // concurrent DB query that was dispatched before the INSERT completed.
  useEffect(() => {
    if (!user || !businessId) return

    supabase
      .from('customers')
      .select('id, points')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setEnrolledCustomer(data as EnrolledCustomer)
      })
  }, [user?.id, businessId])

  return (
    <AuthContext.Provider value={{
      user,
      businessId,
      enrolledCustomer,
      isEnrolled: enrolledCustomer !== null,
      setEnrolledCustomer,
      setBusinessId,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
