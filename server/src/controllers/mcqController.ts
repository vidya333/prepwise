import { Request, Response } from 'express'
import { getMCQsFromGoService } from '../lib/goService'
import Session from '../models/Session'

export const getMCQs = async (req: Request, res: Response) => {
  try {
    const topic = req.query.topic as string || 'general'
    const count = parseInt(req.query.count as string) || 10
    const mcqs = await getMCQsFromGoService(topic, count)
    res.json({ mcqs })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}

export const submitScore = async (req: Request, res: Response) => {
  try {
    const { sessionId, score, total } = req.body
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { $push: { mcqScores: { score, total } } },
      { new: true }
    )
    res.json({ session })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}
