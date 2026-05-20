import { useState, useEffect } from 'react'
import { useSessionStore } from '../../store/sessionStore'
import { useNavigate } from 'react-router-dom'

interface Task {
  id: string
  text: string
  done: boolean
  priority: 'high' | 'medium' | 'low'
  codeSubmission?: string
  aiFeedback?: string     // Stores evaluation feedback from Groq
  isPassed?: boolean      // Tracks if the submission passed criteria
}

async function generateTasks(topic: string, roadmap: any[], questions: any[]): Promise<Task[]> {
  const roadmapTopics = roadmap.slice(0, 3).map((r: any) => r.topic).join(', ')
  const sampleQ = questions.slice(0, 2).map((q: any) => q.text).join(' | ')

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
        content: `Generate 6 highly specific study and practice tasks for today based on this interview prep session.

CRITICAL INSTRUCTION: If the topic or focus area is programming/engineering related, make at least 4 of the 6 tasks small, isolated coding exercises, algorithm challenges, or mini logic logic implementations (e.g., "Write a function to merge two sorted arrays", "Implement a custom helper to format dates", or "Write the regex to extract emails"). 

DO NOT generate broad, macro-level multi-file creation objectives like "Build a banking application", "Create an authentication setup", or "Set up a database architecture". Focus strictly on granular, individual function logic that can be designed and analyzed within a single runtime code file.

Topic: "${topic}"
Roadmap focus areas: ${roadmapTopics}
Sample questions to prepare: ${sampleQ}

Return ONLY a valid JSON array, no markdown, no backticks:
[
  {"id":"t1","text":"specific actionable task","done":false,"priority":"high"},
  {"id":"t2","text":"specific actionable task","done":false,"priority":"high"},
  {"id":"t3","text":"specific actionable task","done":false,"priority":"medium"},
  {"id":"t4","text":"specific actionable task","done":false,"priority":"medium"},
  {"id":"t5","text":"specific actionable task","done":false,"priority":"low"},
  {"id":"t6","text":"specific actionable task","done":false,"priority":"low"}
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

// Evaluation Engine via Groq
async function verifyCodeWithAI(taskText: string, code: string): Promise<{ passed: boolean; feedback: string }> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(import.meta as any).env?.VITE_GROQ_KEY || ''}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2, // Low temperature for consistent, strict grading
      messages: [{
        role: 'user',
        content: `You are an expert technical interviewer code evaluator. Analyze if this code correctly fulfills the given task requirement. Check for syntax correctness, logical edge cases, and proper operational logic matching.

Task Requirement: "${taskText}"
User Code Submission:
\`\`\`
${code}
\`\`\`

Return ONLY a valid JSON object string with no markdown, no backticks, matching this exact structure:
{"passed": true or false, "feedback": "One concise line of praise if passed, or one concise line pointing out the exact bug/fix if failed."}`,
      }],
    }),
  })

  if (!res.ok) throw new Error('AI Verification offline')
  const data = await res.json()
  const text = data.choices[0].message.content.trim()
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(clean)
}

const pStyle: Record<string, string> = {
  high: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300',
  medium: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300',
  low: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300',
}

export default function TasksPage() {
  const { activeSession, saveTasks, updateTaskStats } = useSessionStore()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<Task[]>((activeSession?.tasks as Task[]) ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null)

  useEffect(() => {
    if (activeSession?.tasks && activeSession.tasks.length > 0) {
      setTasks(activeSession.tasks as Task[])
    } else {
      setTasks([])
    }
  }, [activeSession?.id])

  useEffect(() => {
    if (tasks.length > 0) {
      const doneCount = tasks.filter(t => t.done).length
      saveTasks(tasks)
      updateTaskStats(doneCount, tasks.length)
    }
  }, [tasks])

  const loadTasks = async () => {
    if (!activeSession) return
    setLoading(true)
    setError(null)
    try {
      const generated = await generateTasks(
        activeSession.topic,
        activeSession.roadmap || [],
        activeSession.questions || []
      )
      setTasks(generated)
      setExpandedTaskId(null)
    } catch (e: any) {
      setError('Failed to generate tasks: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const toggle = (id: string) =>
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))

  const handleCodeChange = (id: string, code: string) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, codeSubmission: code } : t))
  }

  const handleVerifyCode = async (id: string, text: string, code: string) => {
    if (!code.trim()) return
    setVerifyingTaskId(id)
    try {
      const assessment = await verifyCodeWithAI(text, code)
      setTasks(ts => ts.map(t => t.id === id ? { 
        ...t, 
        isPassed: assessment.passed, 
        aiFeedback: assessment.feedback,
        done: assessment.passed
      } : t))
    } catch (err) {
      alert('Could not verify code right now. Try again.')
    } finally {
      setVerifyingTaskId(null)
    }
  }

  // Filter out macro structural app architecture items
  const isCodingTask = (text: string) => {
    const lowercaseText = text.toLowerCase()
    
    const macroExclusions = ['app', 'application', 'project', 'repo', 'repository', 'database', 'architecture', 'deploy']
    const isTooBig = macroExclusions.some(word => lowercaseText.includes(word))
    
    if (isTooBig) return false

    const keywords = ['write a function', 'implement a', 'write code to', 'algorithm', 'logic for', 'helper to', 'regex', 'function']
    return keywords.some(kw => lowercaseText.includes(kw))
  }

  const done = tasks.filter(t => t.done).length

  if (!activeSession) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-4xl">☑️</div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">No session yet</div>
      <button onClick={() => navigate('/upload')} className="bg-brand-400 text-white px-5 py-2.5 rounded-lg text-sm">Upload PDF →</button>
    </div>
  )

  if (loading) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      <div className="text-sm text-gray-500 dark:text-gray-400">Generating structured tasks...</div>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-lg font-medium mb-0.5 dark:text-gray-50">Tasks</div>
          <div className="text-sm text-gray-400">{activeSession.topic} · {done}/{tasks.length} done</div>
        </div>
        <button onClick={loadTasks} className="text-xs border dark:text-gray-50 border-black/10 dark:border-white/10 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          Regenerate ↺
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4 border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl">
          <div className="text-3xl">📋</div>
          <button onClick={loadTasks} className="bg-[#7F77DD] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium">Generate today's tasks →</button>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
            <div className="h-full rounded-full bg-gradient-to-r from-[#7F77DD] to-[#1D9E75] transition-[width] duration-500" style={{ width: `${Math.round((done / tasks.length) * 100)}%` }} />
          </div>

          <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5 mb-4">
            <div className="space-y-0 divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              {tasks.map(t => {
                const codingAvailable = isCodingTask(t.text)
                const isExpanded = expandedTaskId === t.id
                const isVerifying = verifyingTaskId === t.id

                return (
                  <div key={t.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 cursor-pointer group">
                      {/* Checkbox */}
                      <div 
                        onClick={(e) => { e.stopPropagation(); toggle(t.id); }}
                        className={`w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-all ${
                          t.done ? 'border-[#7F77DD] bg-[#7F77DD]' : 'border-gray-300 dark:border-zinc-600 bg-transparent'
                        }`}
                      >
                        {t.done && <span className="text-white text-[9px] font-bold">✓</span>}
                      </div>
                      
                      {/* Task text item */}
                      <span 
                        onClick={() => codingAvailable && setExpandedTaskId(isExpanded ? null : t.id)}
                        className={`text-xs flex-1 transition-colors leading-relaxed ${t.done ? 'line-through text-gray-400 dark:text-zinc-500' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {t.text}
                      </span>

                      {/* Code Arena Opener */}
                      {codingAvailable && (
                        <span 
                          onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                          className="text-[9px] bg-purple-50 text-purple-500 dark:bg-purple-950/40 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200/40 dark:border-purple-800/20 font-mono cursor-pointer transition-colors"
                        >
                          {isExpanded ? 'hide arena' : 'open arena </>'}
                        </span>
                      )}

                      {/* Priority Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${pStyle[t.priority]}`}>
                        {t.priority}
                      </span>
                    </div>

                    {/* Expandable Small Sandbox Code Editor */}
                    {codingAvailable && isExpanded && (
                      <div className="mt-3 pl-7 space-y-2.5 animate-fadeIn">
                        <textarea
                          value={t.codeSubmission || ''}
                          onChange={(e) => handleCodeChange(t.id, e.target.value)}
                          spellCheck={false} // <--- ADD THIS LINE HERE
                          placeholder="// Implement your function/logic loop solution here..."
                          className="w-full h-36 p-3 rounded-lg font-mono text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-[#7F77DD] dark:text-gray-100 placeholder-gray-400 resize-none shadow-inner"
                        />
                        
                        {/* Dynamic AI Feedback Message Board */}
                        {t.aiFeedback && (
                          <div className={`p-2.5 text-[11px] rounded-md font-medium border ${
                            t.isPassed 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-300' 
                              : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-800/30 dark:text-rose-300'
                          }`}>
                            <span className="font-bold">{t.isPassed ? '✓ Passed: ' : '✗ Bug Detected: '}</span>
                            {t.aiFeedback}
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleVerifyCode(t.id, t.text, t.codeSubmission || '')}
                            disabled={isVerifying || !t.codeSubmission?.trim()}
                            className="bg-[#7F77DD] hover:bg-[#6c63cc] disabled:bg-gray-300 dark:disabled:bg-zinc-800 text-white text-[11px] font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
                          >
                            {isVerifying ? (
                              <>
                                <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                                Analyzing Workspace...
                              </>
                            ) : 'Run AI Code Check'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Success Card with White/5 Adaptive Vibe */}
          {done === tasks.length && tasks.length > 0 && (
            <div className="p-4 rounded-xl text-center bg-[#EEEDFE] dark:bg-white/5 border border-[#AFA9EC] dark:border-white/10 transition-colors">
              <div className="text-2xl mb-1.5">🎉</div>
              <div className="text-[13px] font-medium text-[#3C3489] dark:text-[#a59df6] mb-2.5">
                All tasks done! Great work today.
              </div>
              <button 
                onClick={loadTasks} 
                className="text-xs bg-[#7F77DD] text-white px-4 py-2 rounded-lg border-none cursor-pointer hover:bg-[#6c63cc] transition-colors"
              >
                Generate new tasks →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}