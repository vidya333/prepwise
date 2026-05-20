import { Request, Response } from 'express'
import Session from '../models/Session'
import { analyzePDFViaService, analyzeTopicViaService } from '../lib/pythonService'

export const analyzePDF = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const result = await analyzePDFViaService(req.file.buffer, req.file.originalname)
    const session = await Session.create({
      topic: result.topic || req.file.originalname,
      source: 'pdf',
      questions: result.questions || [],
      keywords: result.keywords || [],
      roadmap: result.roadmap || [],
      progress: 0,
    })
    res.json({ session })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}

export const analyzeTopic = async (req: Request, res: Response) => {
  try {
    const { topic } = req.body
    if (!topic) return res.status(400).json({ error: 'Topic required' })
    const result = await analyzeTopicViaService(topic)
    const session = await Session.create({
      topic, source: 'ai',
      questions: result.questions || [],
      keywords: result.keywords || [],
      roadmap: result.roadmap || [],
      progress: 0,
    })
    res.json({ session })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}
