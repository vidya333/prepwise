import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'

const QUICK_TOPICS = [
  'System Design', 'DBMS', 'Operating Systems', 'DSA',
  'React', 'Node.js', 'Express.js', 'MongoDB',
  'Computer Networks', 'OOPs'
]

async function callGroq(prompt: string) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(import.meta as any).env?.VITE_GROQ_KEY || ''}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error('Groq API failed: ' + res.status)
  const data = await res.json()
  const text = data.choices[0].message.content.trim()
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(clean)
}

async function generateFromTopic(topic: string) {
  return callGroq(`You are an interview prep coach. Generate study material for: "${topic}".
Return ONLY valid JSON, no markdown, no backticks:
{
  "topic": "${topic}",
  "questions": [
    {"id":"q1","text":"full question here","priority":"high","page":null,"concept":"concept name"},
    {"id":"q2","text":"full question here","priority":"high","page":null,"concept":"concept name"},
    {"id":"q3","text":"full question here","priority":"medium","page":null,"concept":"concept name"},
    {"id":"q4","text":"full question here","priority":"medium","page":null,"concept":"concept name"},
    {"id":"q5","text":"full question here","priority":"low","page":null,"concept":"concept name"}
  ],
  "keywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8","kw9","kw10","kw11","kw12"],
  "roadmap": [
    {"day":"Day 1","topic":"topic to study","pages":"","done":false,"priority":"high"},
    {"day":"Day 2","topic":"topic to study","pages":"","done":false,"priority":"high"},
    {"day":"Day 3","topic":"topic to study","pages":"","done":false,"priority":"medium"},
    {"day":"Day 4","topic":"topic to study","pages":"","done":false,"priority":"medium"},
    {"day":"Day 5","topic":"topic to study","pages":"","done":false,"priority":"low"},
    {"day":"Day 6","topic":"topic to study","pages":"","done":false,"priority":"low"},
    {"day":"Day 7","topic":"Mock interview revision","pages":"","done":false,"priority":"high"}
  ]
}`)
}

async function readPDFText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const cleaned = result.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ')
      resolve(cleaned.slice(0, 3000))
    }
    reader.readAsText(file)
  })
}

async function generateFromPDF(file: File, topic: string) {
  const pdfText = await readPDFText(file)
  return callGroq(`You are an interview prep coach. Analyse this study material and generate prep content.
Topic hint from filename: "${topic}"
PDF content sample: "${pdfText}"

Return ONLY valid JSON, no markdown, no backticks:
{
  "topic": "detected topic name",
  "questions": [
    {"id":"q1","text":"question from the material","priority":"high","page":1,"concept":"concept name"},
    {"id":"q2","text":"question from the material","priority":"high","page":2,"concept":"concept name"},
    {"id":"q3","text":"question from the material","priority":"medium","page":3,"concept":"concept name"},
    {"id":"q4","text":"question from the material","priority":"medium","page":4,"concept":"concept name"},
    {"id":"q5","text":"question from the material","priority":"low","page":5,"concept":"concept name"}
  ],
  "keywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8","kw9","kw10","kw11","kw12"],
  "roadmap": [
    {"day":"Day 1","topic":"topic","pages":"pg 1-10","done":false,"priority":"high"},
    {"day":"Day 2","topic":"topic","pages":"pg 11-20","done":false,"priority":"high"},
    {"day":"Day 3","topic":"topic","pages":"pg 21-30","done":false,"priority":"medium"},
    {"day":"Day 4","topic":"topic","pages":"pg 31-40","done":false,"priority":"medium"},
    {"day":"Day 5","topic":"topic","pages":"pg 41-50","done":false,"priority":"low"},
    {"day":"Day 6","topic":"topic","pages":"pg 51-60","done":false,"priority":"low"},
    {"day":"Day 7","topic":"Mock revision","pages":"Full review","done":false,"priority":"high"}
  ]
}`)
}

export default function UploadPage() {
  const [topic, setTopic] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { addSession, setActiveSession } = useSessionStore()

  const saveSession = (data: any, source: 'pdf' | 'ai') => {
    const session = {
      id: Date.now().toString(),
      topic: data.topic,
      source,
      questions: data.questions || [],
      keywords: data.keywords || [],
      roadmap: data.roadmap || [],
      progress: 0,
      createdAt: new Date().toISOString(),
    }
    addSession(session)
    setActiveSession(session)
    navigate('/dashboard')
  }

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file')
      return
    }
    setLoading(true)
    setError(null)
    setStatus('Reading PDF...')
    try {
      const topicGuess = file.name.replace('.pdf', '').replace(/[-_]/g, ' ')
      setStatus('Analysing with Groq AI...')
      const data = await generateFromPDF(file, topicGuess)
      setStatus('Done!')
      saveSession(data, 'pdf')
    } catch (e: any) {
      setError('Failed: ' + e.message + '. Make sure VITE_GROQ_KEY is set in client/.env')
    } finally {
      setLoading(false)
      setStatus('')
    }
  }

  const handleTopic = async (t: string) => {
    const picked = t || topic
    if (!picked.trim()) { setError('Please enter a topic'); return }
    setLoading(true)
    setError(null)
    setStatus(`Generating ${picked} prep material...`)
    try {
      const data = await generateFromTopic(picked)
      setStatus('Done!')
      saveSession(data, 'ai')
    } catch (e: any) {
      setError('Failed: ' + e.message + '. Make sure VITE_GROQ_KEY is set in client/.env')
    } finally {
      setLoading(false)
      setStatus('')
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <div className="text-lg font-medium mb-0.5 dark:text-gray-50">Upload PDF</div>
        <div className="text-sm text-gray-400">Add your study material</div>
      </div>

      {/* API key notice */}
      {/* <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-xs text-orange-700 dark:text-orange-300">
        ⚠ Add <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">VITE_GROQ_KEY=gsk_...</code> to <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">client/.env</code> then restart <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">npm run dev</code> · Get free key at <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="underline">console.groq.com</a>
      </div> */}

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors mb-6 ${
          dragging
            ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
            : 'border-black/10 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-600'
        }`}
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) handleFile(f)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {loading ? (
          <>
            <div className="flex justify-center mb-3">
              <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-sm font-medium text-orange-500">{status}</div>
            <div className="text-xs text-gray-400 mt-1">This takes about 5–10 seconds</div>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">📄</div>
            <div className="text-sm font-medium mb-1.5 dark:text-gray-50">Drop your PDF here</div>
            <div className="text-xs text-gray-400 mb-4">
              Textbooks, notes, previous year papers — any study material
            </div>
            <button
              className="text-xs bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
            >
              Browse files
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs rounded-lg leading-relaxed">
          {error}
        </div>
      )}

      {/* AI notes without PDF */}
      <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5">
        <div className="text-sm font-medium mb-1 dark:text-gray-50">No PDF? Generate AI notes by topic</div>
        <div className="text-xs text-gray-400 mb-4">Powered by Groq · Llama 3.3 70B</div>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. React hooks, Express middleware, MongoDB aggregation..."
          className="w-full text-sm border border-black/10 dark:border-white/10 rounded-lg px-3 py-2.5 bg-white dark:bg-white/5 mb-4 focus:outline-none focus:border-orange-400 transition-colors text-gray-900 dark:text-gray-100"
          onKeyDown={e => e.key === 'Enter' && handleTopic(topic)}
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_TOPICS.map(t => (
            <button
              key={t}
              onClick={() => handleTopic(t)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-300 hover:border-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={() => handleTopic(topic)}
          disabled={loading || !topic.trim()}
          className="text-sm bg-orange-400 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg transition-colors font-medium"
        >
          {loading ? 'Generating...' : 'Generate notes with AI →'}
        </button>
      </div>
    </div>
  )
}