import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../store/themeStore'

const FEATURES = [
 { icon: '⚡', title: 'Smart PDF analysis', desc: 'Python + Claude AI extracts key questions, page numbers, and concepts from any PDF instantly.', color: 'orange' },
  { icon: '⌥', title: 'AI roadmap', desc: 'Prioritised day-by-day study plan built around your deadline and weak areas.', color: 'teal' },
  { icon: '⬢', title: 'Visual mindmap', desc: 'Interactive concept map with react-flow — drag, zoom, and explore.', color: 'purple' },
  { icon: '❖', title: 'MCQ test engine', desc: 'Go-powered sub-50ms quiz generation with timer, scoring, and streak tracking.', color: 'orange' },
  { icon: '{ }', title: 'Code examples', desc: 'Tiny clear snippets for every concept — no bloat, just the idea.', color: 'teal' },
  { icon: '✦', title: 'No PDF? No problem', desc: 'Type any topic and get full AI notes, roadmap, and MCQs instantly.', color: 'purple' },
]

const STEPS = [
  { n: '01', title: 'Upload or type', desc: 'Drop your PDF or enter any topic.' },
  { n: '02', title: 'AI analyses it', desc: 'Python extracts text, Claude finds questions and priorities.' },
  { n: '03', title: 'Study smarter', desc: 'Roadmap, mindmap, MCQs — all auto-generated.' },
  { n: '04', title: 'Walk in confident', desc: 'Track progress, test yourself, revise keywords.' },
]

const STACK = [
  { lang: 'TypeScript', role: 'React + Express', color: '#378ADD' },
  { lang: 'Python', role: 'FastAPI + PyMuPDF', color: '#3B6D11' },
  { lang: 'Go', role: 'Gin MCQ engine', color: '#1D9E75' },
  { lang: 'Claude AI', role: 'Extraction + notes', color: '#7F77DD' },
  { lang: 'MongoDB', role: 'Atlas free tier', color: '#085041' },
  { lang: 'Vercel + Render', role: 'Free deployment', color: '#888780' },
]

const TESTIMONIALS = [
  { stars: 5, text: 'Uploaded my System Design PDF and had a full roadmap in 30 seconds. Cleared my Google interview first try.', name: 'Arjun Mehta', role: 'SDE at Google' },
  { text: 'The MCQ engine knew exactly which topics I was weak on before I did.', stars: 5, name: 'Sneha Patil', role: 'Full-stack dev · Pune' },
  { text: 'Typed "DBMS" and got 29 questions, a mindmap, and code examples in one shot.', stars: 5, name: 'Rohan Joshi', role: 'CS final year · BITS Pilani' },
]

const colorMap: Record<string, string> = {
  orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  teal: 'bg-teal-50 text-teal-800 dark:bg-teal-800 dark:text-teal-100',
  purple: 'bg-purple-50 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { dark, toggle } = useThemeStore()

  // Setup DOM references for scroll targets
  const featuresRef = useRef<HTMLElement>(null)
  const howItWorksRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLElement>(null)

  // Smooth scroll controller
  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen  bg-white dark:bg-[#111112] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-black/[0.07] dark:border-white/[0.07] bg-white/90 dark:bg-[#111112]/90 backdrop-blur-md px-6 md:px-20 h-14 flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-orange-400 flex items-center justify-center text-white text-sm">P</div>
              <span className="font-medium text-sm">PrepWise</span>
            </div>

            {/* Desktop Navigation Links - Hidden on mobile, flex on medium screens and up */}
            <div className="hidden md:flex items-center gap-2">
              {[
                { label: 'Features', ref: featuresRef },
                { label: 'How it works', ref: howItWorksRef },
                { label: 'Stack', ref: stackRef }
              ].map(item => (
                <button 
                  key={item.label} 
                  onClick={() => scrollToSection(item.ref)}
                  className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Action Buttons Section */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle - Always visible */}
              <button onClick={toggle} className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" aria-label="Toggle theme">
                {dark ? '☀' : '☾'}
              </button>
              
              {/* CTA Button - Smaller padding on mobile, larger on desktop */}
              <button onClick={() => navigate('/dashboard')} className="text-xs bg-orange-400 hover:bg-orange-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors font-medium whitespace-nowrap">
                Dashboard
              </button>
            </div>
          </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6 text-center border-b border-black/[0.05] dark:border-white/[0.05]">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-900 px-3 py-1.5 rounded-full mb-6">
          ✦ AI-powered interview prep
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-8 leading-tight flex flex-col space-y-2">
          <span>Stop highlighting.</span>
          <span className="text-orange-400">Start understanding.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto mb-8 leading-relaxed">
          Drop any PDF or topic And let PrepWise extracts questions that matter, builds your roadmap, and tests you until you're ready.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
          <button onClick={() => navigate('/upload')} className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors">
            Get started →
          </button>
          <button onClick={() => navigate('/upload')} className="border border-black/10 dark:border-black/10 text-gray-600 dark:text-gray-300 px-6 py-3 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            Try without PDF
          </button>
        </div>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {[['29+','Concepts extracted'],['3x','Faster revision'],['100%','Free to deploy'],['MERN','+ Python + Go']].map(([v,l]) => (
            <div key={l} className="text-center">
              <div className="text-xl font-semibold text-brand-400">{v}</div>
              <div className="text-xs text-gray-400 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* App preview bar */}
      <section className="px-6 py-8 ">
        <div className="max-w-2xl mx-auto border border-black/[0.08] dark:border-white/[0.08] rounded-xl overflow-hidden">
          <div className="bg-gray-50 dark:bg-white/5 border-b border-black/[0.06] dark:border-white/[0.06] px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white dark:bg-white/10 rounded-md text-center text-xs text-gray-400 py-1">prepwise.vercel.app/dashboard</div>
          </div>
          <div className="flex h-48">
            <div className="w-36 bg-gray-50 dark:bg-white/5 border-r border-black/[0.06] dark:border-white/[0.06] p-3 space-y-1 text-xs">
              {['Dashboard','Upload PDF','Roadmap','Mindmap','MCQ test','Tasks','Keywords'].map((item,i) => (
                <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${i===0?'text-orange-500 font-medium bg-orange-50 dark:bg-orange-900':'text-gray-400 dark:text-gray-500'}`}>
                  <span className="text-xs">{['⬛','↑','→','⬡','✓','☑','#'][i]}</span>{item}
                </div>
              ))}
            </div>
            <div className="flex-1 p-4">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[['62%','Progress'],['78%','MCQ accuracy'],['5d','Streak']].map(([v,l]) => (
                  <div key={l} className="bg-gray-50 dark:bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-base font-medium text-orange-400">{v}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
              {[['Scalability','90%','#7F77DD'],['Caching','60%','#F97C42'],['Microservices','22%','#E24B4A']].map(([l,w,c]) => (
                <div key={l} className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-gray-400 w-20 shrink-0">{l}</span>
                  <div className="flex-1 h-1 bg-gray-100 dark:bg-white/10 rounded">
                    <div className="h-1 rounded" style={{width:w, background:c}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="lg:px-20 px-6 py-12 border-t border-black/[0.05] dark:border-white/[0.05] scroll-mt-14 ">
        <div className="text-xs font-medium text-orange-500 mb-2">Features</div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">Everything to crack the interview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm">AI does the heavy lifting — you focus on understanding.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURES.map(f => (
            <div key={f.title} className="border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5 hover:border-orange-300 dark:hover:border-orange-600 transition-colors group">
              <div className={`inline-flex w-9 h-9 rounded-lg items-center justify-center text-base mb-3 ${colorMap[f.color]}`}>{f.icon}</div>
              <div className="text-sm font-medium mb-1.5">{f.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section ref={howItWorksRef} className="lg:px-20 px-6 py-12 border-t border-black/[0.05] dark:border-white/[0.05] scroll-mt-14">
        <div className="text-xs font-medium text-orange-500 mb-2">How it works</div>
        <h2 className="text-2xl font-semibold mb-8 tracking-tight">From PDF to ready in minutes</h2>
        <div className="border border-black/[0.07] dark:border-white/[0.07] rounded-xl overflow-hidden grid sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.07] dark:divide-white/[0.07]">
          {STEPS.map(s => (
            <div key={s.n} className="p-5">
              <div className="text-xs font-mono text-orange-400 mb-3">{s.n}</div>
              <div className="text-sm font-medium mb-1.5">{s.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section ref={stackRef} className="lg:px-20 px-6 py-12 border-t border-black/[0.05] dark:border-white/[0.05] scroll-mt-14">
        <div className="text-xs font-medium text-orange-500 mb-2">Tech stack</div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">Three languages, one killer app</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Deploy free, looks impressive on your GitHub.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {STACK.map(s => (
            <div key={s.lang} className="border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-4 text-center">
              <div className="w-2 h-2 rounded-full mx-auto mb-2.5" style={{background:s.color}} />
              <div className="text-xs font-medium">{s.lang}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{s.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="lg:px-20 px-6 py-12 border-t border-black/[0.05] dark:border-white/[0.05]">
        <div className="text-xs font-medium text-orange-500 mb-2">Students love it</div>
        <h2 className="text-2xl font-semibold mb-8 tracking-tight">What students say</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5">
              <div className="text-yellow-300 text-xs mb-3">{'★'.repeat(t.stars)}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">"{t.text}"</p>
              <div className="text-xs font-medium">{t.name}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center border-t border-black/[0.05] dark:border-white/[0.05]">
        <h2 className="text-2xl font-semibold mb-3 tracking-tight">Ready to prep smarter?</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Free forever · Open source · MERN + Python + Go</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={() => navigate('/upload')} className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors">
            Upload a PDF →
          </button>
          <button onClick={() => navigate('/dashboard')} className="border border-black/10 dark:border-white/10 px-6 py-3 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            View dashboard
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between text-xs text-gray-400">
        <span className='mx-auto w-100 ps-20'>PrepWise · AI-powered interview prep tool By Vidya Tandel</span>
        <div className="flex gap-4">
          {['Dream','Draw','Develop'].map(l => (
            <span key={l} className="hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors">{l}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}