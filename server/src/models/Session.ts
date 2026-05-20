import mongoose, { Schema, Document } from 'mongoose'

export interface ISession extends Document {
  topic: string; source: 'pdf'|'ai'
  questions: { id:string; text:string; priority:string; page?:number; concept:string }[]
  keywords: string[]; roadmap: object[]; progress: number
  mcqScores: { score:number; total:number; date:Date }[]
  createdAt: Date
}

const SessionSchema = new Schema<ISession>({
  topic: { type: String, required: true },
  source: { type: String, enum: ['pdf','ai'], default: 'ai' },
  questions: [{ id:String, text:String, priority:String, page:Number, concept:String }],
  keywords: [String],
  roadmap: [Schema.Types.Mixed],
  progress: { type: Number, default: 0 },
  mcqScores: [{ score:Number, total:Number, date:{ type:Date, default:Date.now } }],
}, { timestamps: true })

export default mongoose.model<ISession>('Session', SessionSchema)
