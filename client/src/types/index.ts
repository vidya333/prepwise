export type Priority = 'high' | 'medium' | 'low'

export interface MCQOption { id: string; text: string }
export interface MCQ {
  id: string; question: string; options: MCQOption[]
  correctId: string; explanation: string; concept: string
}

export interface WebRef { title: string; url: string; source: string }
export interface CodeExample { concept: string; language: string; code: string }
