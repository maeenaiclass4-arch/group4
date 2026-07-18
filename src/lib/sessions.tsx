import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { PromptSession } from './types'
import { loadHistory, saveHistory } from './storage'

interface SessionsContextValue {
  sessions: PromptSession[]
  addSession: (session: PromptSession) => void
  toggleFavorite: (id: string) => void
  deleteSession: (id: string) => void
}

const SessionsContext = createContext<SessionsContextValue | null>(null)

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<PromptSession[]>(() => loadHistory())

  useEffect(() => {
    saveHistory(sessions)
  }, [sessions])

  const value = useMemo<SessionsContextValue>(
    () => ({
      sessions,
      addSession: (session) => setSessions((prev) => [session, ...prev]),
      toggleFavorite: (id) =>
        setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s))),
      deleteSession: (id) => setSessions((prev) => prev.filter((s) => s.id !== id)),
    }),
    [sessions],
  )

  return <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>
}

export function useSessions(): SessionsContextValue {
  const ctx = useContext(SessionsContext)
  if (!ctx) throw new Error('useSessions must be used within SessionsProvider')
  return ctx
}
