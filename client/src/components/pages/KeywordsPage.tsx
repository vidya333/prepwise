import { useSessionStore } from '../../store/sessionStore'

const FALLBACK_KW = ['Consistent hashing','CAP theorem','Sharding','LRU cache','Pub/Sub','Rate limiting','Leader election','CDN','Indexing','Eventual consistency','Load balancing','Circuit breaker']

export default function KeywordsPage() {
  const { activeSession } = useSessionStore()
  const keywords = activeSession?.keywords?.length ? activeSession.keywords : FALLBACK_KW
  const topic = activeSession?.topic ?? 'System Design'

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <div className="text-lg font-medium mb-0.5 dark:text-gray-50">Keywords</div>
        <div className="text-sm text-gray-400">Extracted from: {topic}</div>
      </div>
      <div className="bg-white dark:bg-[#111112] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5">
        <div className="text-sm font-medium mb-4 dark:text-gray-50">Key concepts — {topic}</div>
        <div className="flex flex-wrap gap-2">
          {keywords.map((k: string) => (
            <span key={k} className="text-xs px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-300 hover:border-orange-300 transition-colors">
              {k}
            </span>
          ))}
        </div>
        {!activeSession && (
          <p className="text-xs text-gray-400 mt-4">Upload a PDF to see keywords extracted from your material</p>
        )}
      </div>
    </div>
  )
}