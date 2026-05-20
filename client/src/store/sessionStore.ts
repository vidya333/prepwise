import { create } from 'zustand'

export interface Question {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
  page?: number
  concept: string
}

export interface RoadmapDay {
  day: string
  topic: string
  pages?: string
  done: boolean
  priority: 'high' | 'medium' | 'low'
}

export interface MCQScore {
  score: number
  total: number
  date: string
  accuracy: number
}

export interface TaskStats {
  done: number
  total: number
  lastUpdated: string
}

export interface Task {
  id: string
  text: string
  done: boolean
  priority: 'high' | 'medium' | 'low'
}

export interface PrepSession {
  id: string
  topic: string
  source: 'pdf' | 'ai'
  questions: Question[]
  keywords: string[]
  roadmap: RoadmapDay[]
  progress: number
  createdAt: string
  mcqScores?: MCQScore[]
  taskStats?: TaskStats
  tasks?: Task[]
}

interface SessionStore {
  sessions: PrepSession[]
  activeSession: PrepSession | null
  setActiveSession: (s: PrepSession) => void
  addSession: (s: PrepSession) => void
  deleteSession: (id: string) => void
  markDayDone: (dayIndex: number) => void
  addMCQScore: (score: number, total: number) => void
  updateTaskStats: (done: number, total: number) => void
  saveTasks: (tasks: Task[]) => void
}

const STORAGE_KEY = 'prepwise-sessions'
const ACTIVE_KEY = 'prepwise-active-id'

function loadFromStorage(): {
  sessions: PrepSession[]
  activeSession: PrepSession | null
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const sessions: PrepSession[] = raw ? JSON.parse(raw) : []
    const activeId = localStorage.getItem(ACTIVE_KEY)
    const activeSession =
      sessions.find(s => s.id === activeId) ?? sessions[0] ?? null
    return { sessions, activeSession }
  } catch {
    return { sessions: [], activeSession: null }
  }
}

function saveToStorage(sessions: PrepSession[], activeId: string | null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch {}
}

const { sessions: initSessions, activeSession: initActive } = loadFromStorage()

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: initSessions,
  activeSession: initActive,

  setActiveSession: (s) => {
    localStorage.setItem(ACTIVE_KEY, s.id)
    set({ activeSession: s })
  },

  addSession: (s) =>
    set((st) => {
      const sessions = [s, ...st.sessions]
      saveToStorage(sessions, s.id)
      return { sessions, activeSession: s }
    }),

  deleteSession: (id) =>
    set((st) => {
      const sessions = st.sessions.filter(s => s.id !== id)
      const activeSession =
        st.activeSession?.id === id
          ? sessions[0] ?? null
          : st.activeSession
      saveToStorage(sessions, activeSession?.id ?? null)
      return { sessions, activeSession }
    }),

  markDayDone: (dayIndex) =>
    set((st) => {
      if (!st.activeSession) return st
      const roadmap = st.activeSession.roadmap.map((r, i) =>
        i === dayIndex ? { ...r, done: true } : r
      )
      const doneDays = roadmap.filter(r => r.done).length
      const progress = Math.round((doneDays / roadmap.length) * 100)
      const updated = { ...st.activeSession, roadmap, progress }
      const sessions = st.sessions.map(s =>
        s.id === updated.id ? updated : s
      )
      saveToStorage(sessions, updated.id)
      return { activeSession: updated, sessions }
    }),

  addMCQScore: (score, total) =>
    set((st) => {
      if (!st.activeSession) return st
      const newScore: MCQScore = {
        score,
        total,
        accuracy: Math.round((score / total) * 100),
        date: new Date().toISOString(),
      }
      const mcqScores = [
        ...(st.activeSession.mcqScores ?? []),
        newScore,
      ]
      const updated = { ...st.activeSession, mcqScores }
      const sessions = st.sessions.map(s =>
        s.id === updated.id ? updated : s
      )
      saveToStorage(sessions, updated.id)
      return { activeSession: updated, sessions }
    }),

  updateTaskStats: (done, total) =>
    set((st) => {
      if (!st.activeSession) return st
      const taskStats: TaskStats = {
        done,
        total,
        lastUpdated: new Date().toISOString(),
      }
      const updated = { ...st.activeSession, taskStats }
      const sessions = st.sessions.map(s =>
        s.id === updated.id ? updated : s
      )
      saveToStorage(sessions, updated.id)
      return { activeSession: updated, sessions }
    }),

  saveTasks: (tasks) =>
    set((st) => {
      if (!st.activeSession) return st
      const updated = { ...st.activeSession, tasks }
      const sessions = st.sessions.map(s =>
        s.id === updated.id ? updated : s
      )
      saveToStorage(sessions, updated.id)
      return { activeSession: updated, sessions }
    }),
}))