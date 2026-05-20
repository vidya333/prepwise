import { create } from 'zustand'

interface ThemeStore {
  dark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  dark: localStorage.getItem('pw-dark') === 'true',
  toggle: () =>
    set((s) => {
      const next = !s.dark
      localStorage.setItem('pw-dark', String(next))
      return { dark: next }
    }),
}))