import { useState, useEffect } from 'react'
import { useSessionStore } from '../../store/sessionStore'
import { useNavigate } from 'react-router-dom'

interface MCQ {
  id: string
  question: string
  options: { id: string; text: string }[]
  correctId: string
  explanation: string
  concept: string
}

async function generateMCQs(topic: string, keywords: string[]): Promise<MCQ[]> {
  const kwList = keywords.slice(0, 6).join(', ')
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(import.meta as any).env?.VITE_GROQ_KEY || ''}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `Generate 5 multiple choice questions for interview prep on topic: "${topic}".
          Focus on these concepts: ${kwList}

          Return ONLY valid JSON array, no markdown, no backticks:
          [
            {
              "id": "1",
              "question": "question text here",
              "options": [
                {"id":"a","text":"option A"},
                {"id":"b","text":"option B"},
                {"id":"c","text":"option C"},
                {"id":"d","text":"option D"}
              ],
              "correctId": "a",
              "explanation": "brief explanation of why this is correct",
              "concept": "concept name"
            }
          ]`,
      }],
    }),
  })
  if (!res.ok) throw new Error('Groq API failed: ' + res.status)
  const data = await res.json()
  const text = data.choices[0].message.content.trim()
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(clean)
}

export default function MCQPage() {
  const { activeSession, addMCQScore } = useSessionStore()
  const navigate = useNavigate()

  const [mcqs, setMcqs] = useState<MCQ[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [scoreSaved, setScoreSaved] = useState(false)
  const [perQ, setPerQ] = useState<boolean[]>([])

  useEffect(() => {
    if (activeSession) loadMCQs()
  }, [activeSession?.id])

  useEffect(() => {
    if (done && mcqs.length > 0 && !scoreSaved) {
      addMCQScore(score, mcqs.length)
      setScoreSaved(true)
    }
  }, [done])

  const loadMCQs = async () => {
    if (!activeSession) return
    setLoading(true)
    setError(null)
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setDone(false)
    setScoreSaved(false)
    setPerQ([])
    try {
      const questions = await generateMCQs(activeSession.topic, activeSession.keywords || [])
      setMcqs(questions)
    } catch (e: any) {
      setError('Failed to generate MCQs: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── No session ──
  if (!activeSession) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-4xl">📝</div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">No session yet</div>
      <div className="text-xs text-gray-400 mb-2 dark:text-gray-50">Upload a PDF or generate AI notes first</div>
      <button onClick={() => navigate('/upload')}
        className="bg-brand-400 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg text-sm transition-colors dark:text-gray-50">
        Upload PDF →
      </button>
    </div>
  )

  // ── Loading ──
  if (loading) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      <div className="text-sm text-gray-500 dark:text-gray-50">Generating MCQs for {activeSession.topic}...</div>
    </div>
  )

  // ── Error ──
  if (error) return (
    <div className="p-6 max-w-2xl">
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-xl mb-4">
        {error}
      </div>
      <button onClick={loadMCQs}
        className="bg-brand-400 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg text-sm transition-colors dark:text-gray-50">
        Try again
      </button>
    </div>
  )

  if (mcqs.length === 0) return null

  // ── Results screen ──
  if (done) {
    const accuracy = Math.round((score / mcqs.length) * 100)
    const accuracyColor = accuracy >= 80 ? '#1D9E75' : accuracy >= 60 ? '#EF9F27' : '#E24B4A'

    return (
      <div className="p-6 max-w-2xl">
        <div className="mb-6">
          <div className="text-lg font-medium mb-0.5 dark:text-gray-50">MCQ Results</div>
          <div className="text-sm text-gray-400 dark:text-gray-50">{activeSession.topic}</div>
        </div>

        <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-6 mb-4">

          {/* Score ring + stats */}
         <div className="flex items-center gap-8 mb-6 pb-6 border-b border-black/[0.05] dark:border-white/[0.05]">
                {/* conic ring */}
                <div 
                  className="w-[100px] h-[100px] rounded-full shrink-0 flex items-center justify-center"
                  style={{ 
                    background: `conic-gradient(${accuracyColor} ${accuracy * 3.6}deg, ${accuracy === 100 ? accuracyColor : 'var(--track-bg, #f3f4f6)'} 0deg)` 
                  }}
                >
                  {/* Inner mask perfectly masks the card background in dark mode */}
                  <div className="w-[76px] h-[76px] rounded-full bg-white dark:bg-[#111112] flex flex-col items-center justify-center [--track-bg:#f3f4f6] dark:[--track-bg:#1f2937]">
                    <div className="text-[22px] font-bold" style={{ color: accuracyColor }}>
                      {accuracy}%
                    </div>
                    <div className="text-[10px] text-gray-400">accuracy</div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-3xl font-semibold mb-1" style={{ color: accuracyColor }}>
                    {score}/{mcqs.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {accuracy === 100 ? '🎉 Perfect! You nailed it.'
                      : accuracy >= 80 ? '👍 Great job! Almost there.'
                      : accuracy >= 60 ? '📖 Good effort! Keep revising.'
                      : '📚 Keep studying and try again.'}
                  </div>
                  
                  {/* Stat Boxes */}
                  <div className="flex gap-3">
                    {[
                      ['Correct', score, '#1D9E75'],
                      ['Wrong', mcqs.length - score, '#E24B4A'],
                      ['Total', mcqs.length, '#7F77DD'],
                    ].map(([label, val, color]) => (
                      <div 
                        key={label as string} 
                        className="bg-gray-50 dark:bg-white/5 rounded-lg py-2 px-3.5 text-center min-w-[64px] border border-transparent dark:border-white/[0.03]"
                      >
                        <div className="text-base font-semibold" style={{ color: color as string }}>
                          {val as number}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

          {/* Per-question review */}
          <div className="mb-6">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
              Question review
            </div>
            <div className="space-y-2">
              {mcqs.map((q, i) => {
                const correct = perQ[i] === true
                const wrong = perQ[i] === false

                // 1. Dynamic container backgrounds (Light vs Dark)
                const cardBg = correct
                  ? "bg-[#f0fdf4] dark:bg-emerald-950/20"
                  : wrong
                  ? "bg-[#fef2f2] dark:bg-rose-950/20"
                  : "bg-gray-50 dark:bg-white/5"

                // 2. Dynamic badge backgrounds
                const badgeBg = correct
                  ? "bg-[#1D9E75]"
                  : wrong
                  ? "bg-[#E24B4A]"
                  : "bg-gray-300 dark:bg-zinc-700"

                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${cardBg}`}>
                    {/* Status Badge */}
                    <div className={`w-[22px] h-[22px] rounded-full shrink-0 text-white text-[11px] font-semibold flex items-center justify-center ${badgeBg}`}>
                      {correct ? '✓' : wrong ? '✗' : i + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5 leading-snug">
                        {q.question}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">
                        {q.concept}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
            <button onClick={loadMCQs}
              style={{
                background: '#7F77DD', color: '#fff',
                padding: '10px 20px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 500,
                border: 'none', cursor: 'pointer',
              }}>
              New questions →
            </button>
            <button onClick={() => {
              setCurrent(0); setSelected(null)
              setScore(0); setDone(false)
              setScoreSaved(false); setPerQ([])
            }}
              className="border border-black/10 dark:border-white/10 px-5 py-2.5 dark:text-gray-50 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Retry same
            </button>
            <button onClick={() => navigate('/dashboard')}
              className="border dark:text-gray-50 border-black/10 dark:border-white/10 px-5 py-2.5 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              View dashboard →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz screen ──
  const q = mcqs[current]
  const answered = selected !== null

  const choose = (id: string) => {
    if (answered) return
    setSelected(id)
    const correct = id === q.correctId
    if (correct) setScore(s => s + 1)
    setPerQ(prev => {
      const next = [...prev]
      next[current] = correct
      return next
    })
  }

  const next = () => {
    if (current + 1 >= mcqs.length) { setDone(true); return }
    setCurrent(c => c + 1)
    setSelected(null)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-lg font-medium mb-0.5 dark:text-gray-50">MCQ test</div>
          <div className="text-sm text-gray-400">{activeSession.topic} · Groq AI generated</div>
        </div>
        <button onClick={loadMCQs}
          className="text-xs border dark:text-gray-50 border-black/10 dark:border-white/10 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          New questions ↺
        </button>
      </div>

      <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-6">

        {/* Progress header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-gray-400">{q.concept}</div>
          <div className="text-xs font-mono" style={{ color: '#7F77DD' }}>
            {current + 1}/{mcqs.length} · Score: {score}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: '6px', background: '#f3f4f6',
          borderRadius: '3px', overflow: 'hidden', marginBottom: '16px',
        }}>
          <div style={{
            height: '100%', borderRadius: '3px',
            width: `${((current + 1) / mcqs.length) * 100}%`,
            background: 'linear-gradient(90deg, #7F77DD, #1D9E75)',
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Mini dots */}
        <div className="flex gap-1.5 mb-5">
          {mcqs.map((_, i) => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: i < current
                ? (perQ[i] ? '#1D9E75' : '#E24B4A')
                : i === current ? '#7F77DD' : '#e5e7eb',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>

        {/* Question */}
        <p className="text-sm leading-relaxed bg-gray-50 dark:bg-white/5 rounded-lg p-4 mb-5 dark:text-gray-50">
          {q.question}
        </p>

        {/* Options */}
        <div className="space-y-2 mb-4 dark:text-gray-50">
          {q.options.map(opt => {
            const isCorrect = opt.id === q.correctId
            const isSelected = opt.id === selected
            let borderColor = '#e5e7eb'
            let bg = 'transparent'
            let textColor = ''
            if (answered) {
              if (isCorrect) { borderColor = '#1D9E75'; bg = '#f0fdf4'; textColor = '#166534' }
              else if (isSelected) { borderColor = '#E24B4A'; bg = '#fef2f2'; textColor = '#991b1b' }
              else { borderColor = '#f3f4f6' }
            }
            return (
              <button key={opt.id} onClick={() => choose(opt.id)} disabled={answered}
                style={{ borderColor, background: bg, color: textColor || undefined }}
                className="w-full text-left text-sm px-4 py-3 rounded-lg border transition-colors disabled:cursor-default hover:border-brand-300">
                <span className="font-mono text-xs text-gray-400 mr-3">
                  {opt.id.toUpperCase()}.
                </span>
                {opt.text}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div className="mt-2 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg mb-4">
            <div className="text-xs font-medium text-teal-700 dark:text-teal-300 mb-1">
              Explanation
            </div>
            <div className="text-xs text-teal-600 dark:text-teal-400 leading-relaxed">
              {q.explanation}
            </div>
          </div>
        )}

        {/* Next button — always inside the card, visible without scrolling */}
        {answered && (
          <div className="pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
            <button onClick={next} style={{
              background: '#7F77DD', color: '#fff',
              padding: '10px 24px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 500,
              border: 'none', cursor: 'pointer',
              width: '100%',
            }}>
              {current + 1 >= mcqs.length ? 'See results →' : 'Next question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}