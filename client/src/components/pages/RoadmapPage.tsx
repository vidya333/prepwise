import { useState } from 'react'
import { useSessionStore } from '../../store/sessionStore'
import { useNavigate } from 'react-router-dom'

const pStyle: Record<string, string> = {
  high: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300',
  medium: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300',
  low: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300',
}

async function fetchDayQA(topic: string, dayTopic: string): Promise<{ q: string; a: string; code?: string; lang?: string }[]> {
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
        content: `You are an interview prep coach for "${topic}".
Generate 4 interview questions with detailed answers about: "${dayTopic}".

For questions where code helps understanding (syntax, APIs, patterns, examples), include a short code snippet (max 10 lines).
For theoretical/conceptual questions, omit the code field.

Return ONLY valid JSON array, no markdown, no backticks:
[
  {
    "q": "interview question here",
    "a": "detailed answer in 2-3 sentences",
    "code": "optional short code snippet here, omit this field if not needed",
    "lang": "javascript"
  }
]`,
      }],
    }),
  })
  if (!res.ok) throw new Error('Groq failed')
  const data = await res.json()
  const text = data.choices[0].message.content.trim()
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(clean)
}

interface QAItem { q: string; a: string; code?: string; lang?: string }

export default function RoadmapPage() {
  const { activeSession, markDayDone } = useSessionStore()
  const navigate = useNavigate()

  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [dayQA, setDayQA] = useState<Record<number, QAItem[]>>({})
  const [loadingDay, setLoadingDay] = useState<number | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [errorDay, setErrorDay] = useState<number | null>(null)

  if (!activeSession) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-4xl dark:text-gray-50">🗺</div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">No session yet</div>
      <div className="text-xs text-gray-400 mb-2">Upload a PDF or generate AI notes first</div>
      <button onClick={() => navigate('/upload')}
        className="bg-brand-400 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg text-sm transition-colors">
        Upload PDF →
      </button>
    </div>
  )

  const roadmap = activeSession.roadmap || []
  const topic = activeSession.topic

  const handleDayClick = async (i: number) => {
    // collapse if already open
    if (expandedDay === i) { setExpandedDay(null); return }
    setExpandedDay(i)
    // already loaded
    if (dayQA[i]) return
    setLoadingDay(i)
    setErrorDay(null)
    try {
      const qa = await fetchDayQA(topic, roadmap[i].topic)
      setDayQA(prev => ({ ...prev, [i]: qa }))
    } catch {
      setErrorDay(i)
    } finally {
      setLoadingDay(null)
    }
  }

  const handleCheck = (dayIndex: number, qIndex: number, totalQs: number) => {
    const key = `${dayIndex}-${qIndex}`
    const updated = { ...checked, [key]: !checked[key] }
    setChecked(updated)

    // count how many in this day are checked
    const dayChecked = Array.from({ length: totalQs }, (_, j) => updated[`${dayIndex}-${j}`]).filter(Boolean).length
    if (dayChecked === totalQs) {
      markDayDone(dayIndex)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <div className="text-lg font-medium mb-0.5 dark:text-gray-50">Roadmap</div>
        <div className="text-sm text-gray-400">{topic} · AI generated</div>
      </div>

      <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.05]">
          <div className="text-sm font-medium dark:text-gray-50">{topic} · {roadmap.length} day plan</div>
          <div className="text-xs text-gray-400 mt-0.5 dark:text-gray-50">
            {roadmap.filter(r => r.done).length} of {roadmap.length} days completed
          </div>
          {/* overall progress bar */}
            <div style={{
              marginTop: '12px',
              width: '100%',
              height: '8px',
              background: '#f3f4f6',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                borderRadius: '4px',
                width: `${Math.round((roadmap.filter((r: any) => r.done).length / (roadmap.length || 1)) * 100)}%`,
                background: 'linear-gradient(90deg, #7F77DD, #1D9E75, #F97C42)',
                transition: 'width 0.4s ease',
              }} />
            </div>
        </div>

        {roadmap.map((r: any, i: number) => {
          const isExpanded = expandedDay === i
          const isLoading = loadingDay === i
          const qa: QAItem[] = dayQA[i] || []
          const hasError = errorDay === i
          const dayCheckedCount = qa.length
            ? Array.from({ length: qa.length }, (_, j) => checked[`${i}-${j}`]).filter(Boolean).length
            : 0

          return (
            <div key={i} className="border-b border-black/[0.05] dark:border-white/[0.05] last:border-0">
              {/* Day row — clickable */}
              <div
                onClick={() => handleDayClick(i)}
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors select-none"
              >
                {/* done dot */}
                <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: r.done ? '#7F77DD' : 'transparent',
                      border: r.done ? '2px solid #7F77DD' : '2px solid #d1d5db',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {r.done && (
                      <svg viewBox="0 0 10 10" width="10" height="10" fill="none">
                        <path d="M2 5.5l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                </div>

                <span className="text-xs font-mono text-gray-400 w-12 shrink-0">{r.day}</span>
                <span className="text-sm flex-1 font-medium text-gray-800 dark:text-gray-200">{r.topic}</span>

                {r.pages && (
                  <span className="text-xs text-gray-400 shrink-0">{r.pages}</span>
                )}
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${pStyle[r.priority] ?? pStyle.low}`}>
                  {r.priority}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full shrink-0 ${
                  r.done
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-gray-50'
                    : 'bg-gray-50 text-gray-400 dark:bg-white/5'
                }`}>
                  {r.done ? 'Done ✓' : 'Pending'}
                </span>
                <span className="text-gray-300 dark:text-gray-600 text-sm">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>

              {/* Expanded Q&A panel */}
              {isExpanded && (
                <div className="px-5 pb-5 bg-gray-50 dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.05]">
                  {isLoading ? (
                    <div className="flex items-center gap-3 py-6">
                      <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-400">Generating questions for {r.topic}...</span>
                    </div>
                  ) : hasError ? (
                    <div className="py-4">
                      <div className="text-sm text-red-500 mb-3">Failed to load questions</div>
                      <button onClick={() => { setErrorDay(null); handleDayClick(i) }}
                        className="text-xs bg-brand-400 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition-colors">
                        Retry
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="pt-4 mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Questions for {r.topic}
                        </span>
                        <span className="text-xs text-brand-500 dark:text-gray-50">
                          {dayCheckedCount}/{qa.length} answered
                        </span>
                      </div>
                      <div className="space-y-3">
                        {qa.map((item, j) => {
                          const key = `${i}-${j}`
                          const isChecked = !!checked[key]
                          return (
                            <div key={j}
                              className={`border rounded-xl p-4 transition-colors ${
                                isChecked
                                  ? 'border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20'
                                  : 'border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#111112]'
                              }`}>
                              {/* Question row */}
                              <div className="flex items-start gap-3 mb-3">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCheck(i, j, qa.length) }}
                                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                    isChecked
                                      ? 'bg-brand-400 border-brand-400 text-white'
                                      : 'border-black/20 dark:border-white/20 hover:border-brand-400'
                                  }`}>
                                  {isChecked && <span className="text-[10px] font-bold">✓</span>}
                                </button>
                                <p className={`text-sm font-medium leading-relaxed ${
                                  isChecked ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'
                                }`}>
                                  {item.q}
                                </p>
                              </div>
                              {/* Answer */}
                              {/* Answer */}
                              <div className="ml-8 space-y-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                                  {item.a}
                                </div>

                                {/* Code snippet — only if returned by AI */}
                                {item.code && (
                                  <div className="rounded-lg overflow-hidden border border-black/[0.07] dark:border-white/[0.07]">
                                    {/* code bar */}
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 dark:bg-black/40">
                                      <span className="text-[10px] text-gray-400 font-mono">
                                        {item.lang || 'code'}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          navigator.clipboard.writeText(item.code!)
                                        }}
                                        className="text-[10px] text-gray-400 hover:text-gray-200 transition-colors"
                                      >
                                        copy
                                      </button>
                                    </div>
                                    {/* code body */}
                                    <pre className="bg-gray-900 dark:bg-black/60 text-gray-100 text-xs font-mono p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap break-words">
                                      {item.code!
                                        .replace(/\\n/g, '\n')
                                        .replace(/\\t/g, '  ')
                                        .trim()
                                      }
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Auto-complete message */}
                      {dayCheckedCount === qa.length && qa.length > 0 && (
                        <div className="mt-4 p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg text-center">
                          <span className="text-sm text-brand-600 font-medium dark:text-gray-50">
                            🎉 {r.day} complete! Great work.
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}