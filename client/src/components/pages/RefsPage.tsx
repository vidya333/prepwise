import { useState, useEffect } from 'react'
import { useSessionStore } from '../../store/sessionStore'
import { useNavigate } from 'react-router-dom'

interface Ref {
  title: string
  url: string
  source: string
  category: string
}

async function generateRefs(topic: string, keywords: string[]): Promise<Ref[]> {
  const kwList = keywords.slice(0, 8).join(', ')
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(import.meta as any).env?.VITE_GROQ_KEY || ''}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: `You are a study resource curator. Generate 8 real, accurate web references for someone preparing for interviews on: "${topic}".
Key concepts to cover: ${kwList}

Return ONLY valid JSON array, no markdown, no backticks:
[
  {
    "title": "descriptive title of the resource",
    "url": "https://actual-real-url.com",
    "source": "domain.com",
    "category": "Documentation | Article | Video | GitHub | Practice"
  }
]

Rules:
- Use ONLY real, well-known URLs that actually exist
- Mix categories: official docs, GitHub repos, articles, YouTube channels
- Make them specific to ${topic}
- Examples of good sources: MDN, official docs, GitHub repos, dev.to, medium, youtube, freecodecamp, geeksforgeeks`
      }],
    }),
  })
  if (!res.ok) throw new Error('Groq API failed: ' + res.status)
  const data = await res.json()
  const text = data.choices[0].message.content.trim()
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(clean)
}

const categoryColor: Record<string, string> = {
  Documentation: '#378ADD',
  Article: '#1D9E75',
  Video: '#E24B4A',
  GitHub: '#dbc85c',
  Practice: '#EF9F27',
}

export default function RefsPage() {
  const { activeSession } = useSessionStore()
  const navigate = useNavigate()

  const [refs, setRefs] = useState<Ref[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (activeSession) loadRefs()
  }, [activeSession?.id])

  const loadRefs = async () => {
    if (!activeSession) return
    setLoading(true)
    setError(null)
    try {
      const generated = await generateRefs(
        activeSession.topic,
        activeSession.keywords || []
      )
      setRefs(generated)
    } catch (e: any) {
      setError('Failed to generate refs: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!activeSession) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-4xl">🔗</div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">No session yet</div>
      <div className="text-xs text-gray-400 mb-2">Upload a PDF or generate AI notes first</div>
      <button onClick={() => navigate('/upload')}
        className="bg-brand-400 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg text-sm transition-colors">
        Upload PDF →
      </button>
    </div>
  )

  if (loading) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      <div className="text-sm text-gray-500">Finding best resources for {activeSession.topic}...</div>
    </div>
  )

  if (error) return (
    <div className="p-6 max-w-2xl">
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-xl mb-4">
        {error}
      </div>
      <button onClick={loadRefs}
        className="bg-brand-400 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg text-sm transition-colors">
        Try again
      </button>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-lg font-medium mb-0.5 dark:text-gray-300">Web references</div>
          <div className="text-sm text-gray-400">
            Curated for {activeSession.topic} · {refs.length} resources
          </div>
        </div>
        <button onClick={loadRefs}
          className="text-xs border dark:text-gray-300 border-black/10 dark:border-white/10 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          Refresh ↺
        </button>
      </div>

      {refs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4 border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl">
          <div className="text-3xl">🔗</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">No references yet</div>
          <button onClick={loadRefs} style={{
            background: '#7F77DD', color: '#fff',
            padding: '10px 20px', borderRadius: '8px',
            fontSize: '13px', fontWeight: 500,
            border: 'none', cursor: 'pointer',
          }}>
            Generate references →
          </button>
        </div>
      ) : (
        <>
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from(new Set(refs.map(r => r.category))).map(cat => (
              <span key={cat} style={{
                fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                background: `${categoryColor[cat] || '#888'}22`,
                color: categoryColor[cat] || '#888',
                fontWeight: 500,
              }}>
                {cat}
              </span>
            ))}
          </div>

          <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl overflow-hidden">
            {refs.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group">

                {/* category dot */}
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: categoryColor[r.category] || '#888',
                }} />

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-brand-500 transition-colors leading-snug">
                    {r.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{r.source}</div>
                </div>

                {/* category badge */}
                <span style={{
                  fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                  background: `${categoryColor[r.category] || '#888'}18`,
                  color: categoryColor[r.category] || '#888',
                  fontWeight: 500, flexShrink: 0,
                }}>
                  {r.category}
                </span>

                <span className="text-gray-300 dark:text-gray-600 text-sm shrink-0 group-hover:text-brand-400 transition-colors">
                  ↗
                </span>
              </a>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            AI-generated links — verify before use · click to open in new tab
          </p>
        </>
      )}
    </div>
  )
}