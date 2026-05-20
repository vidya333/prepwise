import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000' })

api.interceptors.request.use((c) => {
  const token = localStorage.getItem('pw_token')
  if (token) c.headers.Authorization = `Bearer ${token}`
  return c
})

export const analyzePDF = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/api/analyze/pdf', fd)
}

export const analyzeTopicAI = (topic: string) =>
  api.post('/api/analyze/topic', { topic })

export const getMCQs = (topic: string, count = 10) =>
  api.get(`/api/mcq?topic=${topic}&count=${count}`)

export const submitMCQScore = (sessionId: string, score: number, total: number) =>
  api.post('/api/mcq/score', { sessionId, score, total })

export const getDashboard = () => api.get('/api/dashboard')

export default api
