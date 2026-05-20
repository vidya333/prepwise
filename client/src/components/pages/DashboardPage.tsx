import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'

const pStyle: Record<string, string> = {
  high: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300',
  medium: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300',
  low: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300',
}

const BAR_COLORS = [
  '#7F77DD',
  '#1D9E75',
  '#F97C42',
  '#E24B4A',
  '#EF9F27',
  '#378ADD',
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { activeSession, sessions, setActiveSession, deleteSession } = useSessionStore()
  const questions = activeSession?.questions ?? []
  const roadmap = (activeSession?.roadmap ?? []) as any[]
  const doneDays = roadmap.filter((r: any) => r.done).length
  const totalDays = roadmap.length || 1
  const progress = Math.round((doneDays / totalDays) * 100)
  const topic = activeSession?.topic ?? null

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="text-lg font-medium mb-0.5 dark:text-gray-50">Dashboard</div>
        <div className="text-sm text-gray-400">
          {topic
            ? `${topic} · ${roadmap.length} day plan`
            : 'No session yet — upload a PDF to get started'}
        </div>
      </div>

      {!activeSession ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-4xl">📂</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">No study session yet</div>
          <div className="text-xs text-gray-400 mb-2">Upload a PDF or generate AI notes to begin</div>
          <button
            onClick={() => navigate('/upload')}
            className="bg-brand-400 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Upload PDF →
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              [progress + '%', 'Overall progress', `${doneDays} of ${roadmap.length} days done`],
              [questions.length + '', 'Questions extracted', 'from your material'],
              [activeSession.keywords?.length + '', 'Keywords found', 'click Keywords tab'],
              [activeSession.source === 'pdf' ? 'PDF' : 'AI', 'Source', 'session type'],
            ].map(([v, l, s]) => (
              <div key={l} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">{l}</div>
                <div className="text-2xl font-semibold text-brand-400 dark:text-gray-50">{v}</div>
                <div className="text-xs text-gray-400 mt-1">{s}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Roadmap progress */}
            <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5">
              <div className="text-sm font-medium mb-1 dark:text-gray-50">Roadmap progress</div>
              <div className="text-xs text-gray-400 mb-4">
                {doneDays}/{roadmap.length} days · click Roadmap tab to study
              </div>

              {/* Overall gradient bar */}
              <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full mb-5 overflow-hidden">
                <div style={{
                  height: '100%',
                  borderRadius: '4px',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #7F77DD, #1D9E75, #F97C42)',
                  transition: 'width 0.4s ease',
                }} />
              </div>

              {/* Per-day rows */}
              <div className="space-y-3">
                {roadmap.slice(0, 6).map((r: any, i: number) => {
                  const color = BAR_COLORS[i % BAR_COLORS.length]
                  return (
                    <div key={i} className="flex items-center gap-3">
                      {/* colored dot */}
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: r.done ? color : '#e5e7eb',
                        transition: 'background 0.2s',
                      }} />

                      {/* topic name */}
                      <span
                        className="text-xs text-gray-500 dark:text-gray-400 w-28 shrink-0 truncate"
                        title={r.topic}
                      >
                        {r.topic}
                      </span>

                      {/* colored progress bar */}
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div style={{
                          height: '100%',
                          borderRadius: '4px',
                          width: r.done ? '100%' : '0%',
                          background: color,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>

                      {/* status */}
                      <span style={{
                        fontSize: '10px',
                        flexShrink: 0,
                        fontWeight: 500,
                        color: r.done ? color : '#d1d5db',
                      }}>
                        {r.done ? '✓' : r.day}
                      </span>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => navigate('/roadmap')}
                className="mt-5 text-xs text-brand-500 hover:text-brand-600 transition-colors dark:text-gray-50"
                style={{
                      fontSize: '11px', padding: '4px 12px', borderRadius: '8px',
                      background: '#7F77DD', color: '#fff', border: 'none', cursor: 'pointer',
                    }}
              >
                Open roadmap →
              </button>
            </div>

            {/* Sessions */}
            <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5">
              <div className="text-sm font-medium mb-4 dark:text-gray-50">Sessions ({sessions.length})</div>
              <div className="space-y-2">
                {sessions.slice(0, 5).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-2 border-b border-black/[0.04] dark:text-gray-50 dark:border-white/[0.04] last:border-0 group"
                  >
                    {/* source badge with matching color */}
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontWeight: 500,
                      flexShrink: 0,
                      background: s.source === 'pdf' ? '#EEEDFE' : '#E1F5EE',
                      color: s.source === 'pdf' ? '#3C3489' : '#085041',
                    }}>
                      {s.source}
                    </span>

                    {/* topic — click to switch active session */}
                    <span
                      className="text-xs flex-1 truncate cursor-pointer hover:text-brand-500 transition-colors"
                      onClick={() => { setActiveSession(s); navigate('/roadmap') }}
                    >
                      {s.topic}
                    </span>

                    {/* day progress counter with color */}
                    <span style={{
                      fontSize: '10px',
                      flexShrink: 0,
                      color: BAR_COLORS[i % BAR_COLORS.length],
                      fontWeight: 500,
                    }}>
                      {s.roadmap.filter((r: any) => r.done).length}/{s.roadmap.length}d
                    </span>

                    {/* delete button — shows on hover */}
                    <button
                      onClick={() => deleteSession(s.id)}
                      className="text-[10px] text-black-300 dark:text-gray-50 hover:text-red-400 transition-colors opacity-1 group-hover:opacity-100 ml-1"
                      title="Delete session"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MCQ Progress */}
          {(activeSession.mcqScores?.length ?? 0) > 0 && (() => {
            const scores = activeSession.mcqScores!
            const latest = scores[scores.length - 1]
            const avg = Math.round(scores.reduce((a, s) => a + s.accuracy, 0) / scores.length)
            const best = Math.max(...scores.map(s => s.accuracy))

            return (
              <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium dark:text-gray-50">MCQ test progress</div>
                    <div className="text-xs text-gray-400 mt-0.5">{scores.length} test{scores.length > 1 ? 's' : ''} taken · {topic}</div>
                  </div>
                  <button onClick={() => navigate('/mcq')}
                    className="text-xs text-brand-500 hover:text-brand-600 dark:text-gray-50 transition-colors"
                    style={{
                      fontSize: '11px', padding: '4px 12px', borderRadius: '8px',
                      background: '#7F77DD', color: '#fff', border: 'none', cursor: 'pointer',
                    }}>
                    Take test →
                  </button>
                </div>

                {/* stat pills */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    ['Latest', `${latest.score}/${latest.total}`, `${latest.accuracy}%`, '#7F77DD'],
                    ['Average', `${avg}%`, 'accuracy', '#1D9E75'],
                    ['Best', `${best}%`, 'accuracy', '#F97C42'],
                  ].map(([label, val, sub, color]) => (
                    <div key={label} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                      <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px' }}>{label}</div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color }}>{val}</div>
                      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* accuracy trend bars — last 5 attempts */}
                <div className="space-y-2">
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>
                    Last {Math.min(scores.length, 5)} attempts
                  </div>
                  {scores.slice(-5).map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span style={{ fontSize: '10px', color: '#9ca3af', width: '48px', flexShrink: 0 }}>
                        {new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                      <div style={{
                        flex: 1,
                        height: '6px',
                        background: '#f3f4f6',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          borderRadius: '3px',
                          width: `${s.accuracy}%`,
                          background: s.accuracy >= 80 ? '#1D9E75' : s.accuracy >= 60 ? '#EF9F27' : '#E24B4A',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        width: '36px',
                        textAlign: 'right',
                        flexShrink: 0,
                        color: s.accuracy >= 80 ? '#1D9E75' : s.accuracy >= 60 ? '#EF9F27' : '#E24B4A',
                      }}>
                        {s.accuracy}%
                      </span>
                      <span style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0 }}>
                        {s.score}/{s.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Task Progress */}
            {activeSession.taskStats && activeSession.taskStats.total > 0 && (() => {
              const { done: td, total: tt, lastUpdated } = activeSession.taskStats!
              const taskPct = Math.round((td / tt) * 100)
              const taskColor = taskPct === 100 ? '#1D9E75' : taskPct >= 50 ? '#EF9F27' : '#7F77DD'
              return (
                <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-medium dark:text-gray-50">Task completion</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Last updated {new Date(lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button onClick={() => navigate('/tasks')} style={{
                      fontSize: '11px', padding: '4px 12px', borderRadius: '8px',
                      background: '#7F77DD', color: '#fff', border: 'none', cursor: 'pointer',
                    }}>
                      View tasks →
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    
                    {/* ring */}
                    <div 
                      className="w-20 h-20 rounded-full shrink-0 flex items-center justify-center"
                      style={{ background: `conic-gradient(${taskColor} ${taskPct * 3.6}deg, #f3f4f6 0deg)` }}
                    >
                      {/* Using a solid background hex that matches your card background */}
                      <div className="w-[60px] h-[60px] rounded-full bg-white dark:bg-[#111214] flex flex-col items-center justify-center">
                        <div style={{ fontSize: '16px', fontWeight: 700, color: taskColor }}>{taskPct}%</div>
                        <div className="text-[9px] text-[#9ca3af]">done</div>
                      </div>
                    </div>

                    <div className="flex-1">
                      {/* bar */}
                      <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full mb-5 overflow-hidden">
                        <div style={{
                          height: '100%', borderRadius: '4px',
                          width: `${taskPct}%`,
                          background: `linear-gradient(90deg, #7F77DD, ${taskColor})`,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>

                      {/* stat pills */}
                      <div className="flex gap-3">
                        {[
                          ['Done', td, '#1D9E75'],
                          ['Remaining', tt - td, '#E24B4A'],
                          ['Total', tt, '#7F77DD'],
                        ].map(([label, val, color]) => (
                          <div key={label as string} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                            <div style={{ fontSize: '16px', fontWeight: 600, color: color as string }}>
                              {val as number}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {taskPct === 100 && (
                    <div className="mt-3 p-2.5 rounded-g bg-[#EEEDFE] dark:bg-white/5 text-center text-xs text-[#3C3489] dark:text-[#a59df6] font-medium">
                      🎉 All tasks completed! Head to Tasks for new ones.
                    </div>
                  )}
                </div>
              )
            })()}
          {/* AI extracted questions */}
          {questions.length > 0 && (
            <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium dark:text-gray-50">AI extracted questions</div>
                <span className="text-xs text-gray-400">from {topic}</span>
              </div>
              <div className="space-y-2">
                {questions.slice(0, 5).map((q: any) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 p-3 dark:text-gray-50 rounded-lg border border-black/[0.05] dark:border-white/[0.05] hover:border-brand-200 dark:hover:border-brand-700 cursor-pointer transition-colors"
                    onClick={() => navigate('/roadmap')}
                  >
                    <span className={`text-xs w-7 h-7 rounded-full flex items-center justify-center font-medium shrink-0 ${pStyle[q.priority as keyof typeof pStyle]}`}>
                      {q.id}
                    </span>
                    <span className="text-sm flex-1">{q.text}</span>
                    {q.page && (
                      <span className="text-xs text-gray-400">pg {q.page}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pStyle[q.priority as keyof typeof pStyle]}`}>
                      {q.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}