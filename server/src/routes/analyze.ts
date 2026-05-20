import { Router } from 'express'
import multer from 'multer'
import { analyzePDF, analyzeTopic } from '../controllers/analyzeController'

export const analyzeRouter = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

analyzeRouter.post('/pdf', upload.single('file'), analyzePDF)
analyzeRouter.post('/topic', analyzeTopic)
