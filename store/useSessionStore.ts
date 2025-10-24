'use client'

import { create } from 'zustand'

type SessionState = {
  householdId: string | null
  profileId: string | null
  profileName: string | null
}

type SessionActions = {
  setSession: (payload: Partial<SessionState>) => void
  reset: () => void
}

export const useSessionStore = create<SessionState & SessionActions>((set) => ({
  householdId: null,
  profileId: null,
  profileName: null,
  setSession: (payload) => set(payload),
  reset: () => set({ householdId: null, profileId: null, profileName: null }),
}))
