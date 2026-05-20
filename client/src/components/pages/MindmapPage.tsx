import { useState } from 'react'
import { useSessionStore } from '../../store/sessionStore'
import { useNavigate } from 'react-router-dom'

const COLORS = [
  { bg: '#FFF4EE', tc: '#A83610', border: '#FFC5A0' },
  { bg: '#EEEDFE', tc: '#3C3489', border: '#AFA9EC' },
  { bg: '#E1F5EE', tc: '#085041', border: '#9FE1CB' },
  { bg: '#FAEEDA', tc: '#633806', border: '#FAC775' },
  { bg: '#FCEBEB', tc: '#A32D2D', border: '#F5B8B8' },
  { bg: '#EFF6FF', tc: '#1D4ED8', border: '#BFDBFE' },
  { bg: '#F0FDF4', tc: '#166534', border: '#BBF7D0' },
  { bg: '#FDF4FF', tc: '#7E22CE', border: '#E9D5FF' },
]

interface QAItem { q: string; a: string }

async function fetchKeywordQA(topic: string, keyword: string): Promise<QAItem[]> {
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
Generate 4 sub-concepts or key points specifically about "${keyword}" as a mind map tree.

Return ONLY valid JSON array, no markdown:
[
  { "q": "sub-concept or key point title", "a": "1-2 sentence explanation" },
  { "q": "sub-concept or key point title", "a": "1-2 sentence explanation" },
  { "q": "sub-concept or key point title", "a": "1-2 sentence explanation" },
  { "q": "sub-concept or key point title", "a": "1-2 sentence explanation" }
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

export default function MindmapPage() {
  const { activeSession } = useSessionStore()
  const navigate = useNavigate()

  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [subNodes, setSubNodes] = useState<QAItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!activeSession) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-4xl dark:text-gray-50">🕸</div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">No session yet</div>
      <div className="text-xs text-gray-400 mb-2">Upload a PDF or generate AI notes first</div>
      <button onClick={() => navigate('/upload')}
        className="bg-brand-400 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg text-sm transition-colors">
        Upload PDF →
      </button>
    </div>
  )

  const topic = activeSession.topic
  const keywords = activeSession.keywords || []
  const MAX_AROUND = 8
  const surrounding = keywords.slice(0, MAX_AROUND)

  const W = 720, H = 400
  const CX = 360, CY = 200, RADIUS = 145

  const surroundingNodes = surrounding.map((kw, i) => {
    const angle = (2 * Math.PI * i) / surrounding.length - Math.PI / 2
    return { label: kw, x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) }
  })

  const handleKeywordClick = async (kw: string, index: number) => {
    setSelectedKeyword(kw)
    setSelectedIndex(index)
    setSubNodes([])
    setError(null)
    setLoading(true)
    try {
      const qa = await fetchKeywordQA(topic, kw)
      setSubNodes(qa)
    } catch {
      setError('Failed to load. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setSelectedKeyword(null)
    setSubNodes([])
    setError(null)
  }

  // ── Sub-tree view ──
  if (selectedKeyword) {
    const color = COLORS[selectedIndex % COLORS.length]
    const subW = 720, subH = 420
    const subCX = 360, subCY = 210
    const subRadius = 150

    const subNodePositions = subNodes.map((_, i) => {
      const angle = (2 * Math.PI * i) / subNodes.length - Math.PI / 2
      return { x: subCX + subRadius * Math.cos(angle), y: subCY + subRadius * Math.sin(angle) }
    })

    return (
      <div className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <button onClick={handleBack}
            className="flex items-center gap-2 dark:text-gray-50 text-sm text-brand-500 hover:text-brand-600 transition-colors font-medium">
            ← Back
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <div>
            <div className="text-lg font-medium mb-0.5 dark:text-gray-50">{selectedKeyword}</div>
            <div className="text-sm text-gray-400">Sub-concepts tree — {topic}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-4 mb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-7 h-7 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm text-gray-400">Building sub-tree for {selectedKeyword}...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="text-sm text-red-400">{error}</div>
              <button onClick={() => handleKeywordClick(selectedKeyword, selectedIndex)}
                className="text-xs bg-brand-400 text-white px-3 py-1.5 rounded-lg hover:bg-brand-500 transition-colors">
                Retry
              </button>
            </div>
          ) : (
          <svg viewBox="0 0 720 300" className="w-full" style={{ maxHeight: 300 }}>
            {/* center node at left-center */}
            <rect x={60} y={120} width={160} height={44} rx={12} fill="#7F77DD" />
            <text x={140} y={142} textAnchor="middle" dominantBaseline="middle"
              fontSize={13} fontWeight={600} fill="#fff">
              {selectedKeyword.length > 16 ? selectedKeyword.slice(0, 16) + '…' : selectedKeyword}
            </text>

            {/* horizontal connector line from center to branch point */}
            <line x1={220} y1={142} x2={310} y2={142}
              stroke={color.border} strokeWidth={1.5} strokeOpacity={0.7} />

            {/* vertical spine */}
            {subNodes.length > 0 && (
              <line
                x1={310}
                y1={subNodes.length === 1 ? 142 : 142 - ((subNodes.length - 1) / 2) * 60}
                x2={310}
                y2={subNodes.length === 1 ? 142 : 142 + ((subNodes.length - 1) / 2) * 60}
                stroke={color.border} strokeWidth={1.5} strokeOpacity={0.7}
              />
            )}

            {/* sub-nodes — evenly spaced vertically on right side */}
            {subNodes.map((item, i) => {
              const total = subNodes.length
              const startY = 142 - ((total - 1) / 2) * 60
              const ny = startY + i * 60
              const label = item.q.length > 22 ? item.q.slice(0, 22) + '…' : item.q
              const nodeW = Math.max(110, label.length * 7 + 24)
              const c = COLORS[i % COLORS.length]
              return (
                <g key={i}>
                  {/* horizontal branch from spine to node */}
                  <line x1={310} y1={ny} x2={360} y2={ny}
                    stroke={color.border} strokeWidth={1.5} strokeOpacity={0.7} />
                  {/* node */}
                  <rect x={360} y={ny - 16} width={nodeW} height={32}
                    rx={8} fill={c.bg} stroke={c.border} strokeWidth={1} />
                  <text x={360 + nodeW / 2} y={ny + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={11} fill={c.tc} fontWeight={500}>
                    {label}
                  </text>
                </g>
              )
            })}
          </svg>
          )}
        </div>

        {/* Sub-concept detail cards */}
        {!loading && !error && subNodes.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {subNodes.map((item, i) => (
              <div key={i}
                className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-4">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                    style={{ background: '#7F77DD' }}>
                    {i + 1}
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                    {item.q}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed ml-7">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Main mindmap view ──
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="text-lg font-medium mb-0.5 dark:text-gray-50">Mindmap</div>
        <div className="text-sm text-gray-400">Visual concept map — {topic} · click any node to explore</div>
      </div>

     <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-4 mb-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 420 }}>
          {surroundingNodes.map((n, i) => (
            <line 
              key={i}
              x1={CX} y1={CY} x2={n.x} y2={n.y}
              className="stroke-gray-300 dark:stroke-gray-700" 
              strokeOpacity={0.4} 
              strokeWidth={1.5}
            />
          ))}
 
          {/* Center node */}
          <rect x={CX - 75} y={CY - 22} width={150} height={44} rx={12} fill="#7F77DD" />
          <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle"
            fontSize={13} fontWeight={600} fill="#fff">
            {topic.length > 16 ? topic.slice(0, 16) + '…' : topic}
          </text>

          {/* Keyword nodes — clickable */}
          {surroundingNodes.map((n, i) => {
            const c = COLORS[i % COLORS.length]
            const label = n.label.length > 16 ? n.label.slice(0, 16) + '…' : n.label
            const nodeW = Math.max(90, label.length * 7.5 + 24)
            return (
              <g key={i} style={{ cursor: 'pointer' }}
                onClick={() => handleKeywordClick(n.label, i)}>
                <rect x={n.x - nodeW / 2} y={n.y - 18} width={nodeW} height={36}
                  rx={8} fill={c.bg} stroke={c.border} strokeWidth={1.2} />
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize={11} fill={c.tc} fontWeight={500}>
                  {label}
                </text>
              </g>
            )
          })}
        </svg>
        <p className="text-xs text-gray-400 text-center mt-2 dark:color-gray-50">
          Click any keyword node to explore its sub-concepts · {surrounding.length} of {keywords.length} shown
        </p>
      </div>

      {/* Questions */}
      {activeSession.questions?.length > 0 && (
        <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5">
          <div className="text-sm font-medium mb-4 dark:text-gray-50">Key questions — {topic}</div>
          <div className="space-y-2">
            {activeSession.questions.map((q: any) => {
              const pStyle: Record<string, string> = {
                high: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300',
                medium: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300',
                low: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300',
              }
              return (
                <div key={q.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-black/[0.05] dark:border-white/[0.05]">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${pStyle[q.priority] ?? pStyle.low}`}>
                    {q.priority}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{q.text}</span>
                  {q.concept && <span className="text-xs text-gray-400 shrink-0 mt-0.5">{q.concept}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}