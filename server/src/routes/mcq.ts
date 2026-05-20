import { Router } from 'express'
import { getMCQs, submitScore } from '../controllers/mcqController'

export const mcqRouter = Router()
mcqRouter.get('/', getMCQs)
mcqRouter.post('/score', submitScore)
