import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { LoadingSpinner, ErrorDisplay } from '../Status'

export default function NCERTTab({ chapterId }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [activeSection, setActiveSection] = useState('all')

  useEffect(() => {
    let cancelled = false

    async function fetchQuestions() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('ncert_textbook_questions')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('section')
          .order('question_number')

        if (error) throw error
        if (!cancelled) setQuestions(data || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchQuestions()
    return () => { cancelled = true }
  }, [chapterId])

  const sections = [...new Set(questions.map(q => q.section).filter(Boolean))]
  
  const filtered = activeSection === 'all' 
    ? questions 
    : questions.filter(q => q.section === activeSection)

  if (loading) return <LoadingSpinner text="Loading NCERT questions..." />
  if (error) return <ErrorDisplay message={error} />
  if (questions.length === 0) return (
    <div className="text-center py-16">
      <span className="text-5xl block mb-4">📚</span>
      <p className="text-gray-500 dark:text-gray-400">No NCERT textbook questions available yet.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Section filter tabs */}
      {sections.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeSection === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Sections
          </button>
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3">
        {filtered.map(q => (
          <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              className="w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <span className="flex-shrink-0 w-7 h-7 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-bold">
                {q.question_number || '?'}
              </span>
              <div className="flex-1">
                {q.section && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold mb-1 inline-block">
                    {q.section}
                  </span>
                )}
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{q.question}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 mt-1 ${expandedId === q.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedId === q.id && q.answer && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                <div className="mt-3 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800">
                  <span className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wide">Answer</span>
                  <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{q.answer}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
