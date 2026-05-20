import { useState } from 'react'
import { analyzePDF, analyzeTopicAI } from '../lib/api'
import { useSessionStore } from '../store/sessionStore'

export function useAnalysis() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addSession, setActiveSession } = useSessionStore()

  const analyzeFile = async (file: File) => {
    setLoading(true); setError(null)
    try {
      const { data } = await analyzePDF(file)
      addSession(data.session)
      setActiveSession(data.session)
      return data.session
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const analyzeTopic = async (topic: string) => {
    setLoading(true); setError(null)
    try {
      const { data } = await analyzeTopicAI(topic)
      addSession(data.session)
      setActiveSession(data.session)
      return data.session
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  return { analyzeFile, analyzeTopic, loading, error }
}
