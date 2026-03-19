import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SESSION_KEY = 'enroll_demo_mode'

export function useDemoMode(): boolean {
  const location = useLocation()
  const fromState = import.meta.env.DEV && (location.state as { demo?: boolean } | null)?.demo === true

  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (fromState) sessionStorage.setItem(SESSION_KEY, 'true')
  }, [fromState])

  return import.meta.env.DEV && (fromState || sessionStorage.getItem(SESSION_KEY) === 'true')
}
