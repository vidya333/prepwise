import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { analyzeRouter } from './routes/analyze'
import { mcqRouter } from './routes/mcq'
import { dashboardRouter } from './routes/dashboard'

dotenv.config()
const app = express()
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/analyze', analyzeRouter)
app.use('/api/mcq', mcqRouter)
app.use('/api/dashboard', dashboardRouter)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prepwise')
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT || 4000, () => console.log('Server on :4000'))
  })
  .catch(console.error)
