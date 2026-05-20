import { Request, Response } from 'express'
import Session from '../models/Session'

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 }).limit(10)
    const totalSessions = sessions.length
    const avgProgress = sessions.reduce((a, s) => a + s.progress, 0) / (totalSessions || 1)
    const allScores = sessions.flatMap(s => s.mcqScores)
    const avgAccuracy = allScores.length
      ? Math.round(allScores.reduce((a, s) => a + (s.score / s.total) * 100, 0) / allScores.length)
      : 0
    res.json({ sessions, stats: { totalSessions, avgProgress: Math.round(avgProgress), avgAccuracy } })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}
