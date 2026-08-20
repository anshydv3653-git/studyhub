import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { LoadingSpinner, ErrorDisplay } from '../Status'

export default function PYQTab({ chapterId }) {
  const [pyqs, setPyqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterYear, setFilterYear] = useState('all')
  const [filterBoard, setFilterBoard] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchPYQs() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('pyqs')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('year', { ascending: false })

        if (error) throw error
        if (!cancelled) setPyqs(data || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPYQs()
    return () => { cancelled = true }
  }, [chapterId])

  const years = [...new Set(pyqs.map(p => p.year).filter(Boolean))]
  const boards = [...new Set(pyqs.map(p => p.board_year).filter(Boolean))]

  const filtered = pyqs.filter(p => {
    if (filterYear !== 'all' && p.year != filterYear) return false
    if (filterBoard !== 'all' && p.board_year !== filterBoard) return false
    return true
  })

  if (loading) return <LoadingSpinner text="Loading previous year questions..." />
  if (error) return <ErrorDisplay message={error} />
  if (pyqs.length === 0) return (
    <div className="text-center py-16">
      <span className="text-5xl block mb-4">📋</span>
      <p className="text-gray-500 dark:text-gray-400">No previous year questions available yet.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select
          value={filterBoard}
          onChange={e => setFilterBoard(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="all">All Boards</option>
          {boards.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 self-center">
          {filtered.length} question{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {filtered.map(pyq => (
          <div key={pyq.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === pyq.id ? null : pyq.id)}
              className="w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex-shrink-0 flex gap-2 mt-0.5">
                {pyq.year && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-warm-100 dark:bg-warm-900/30 text-warm-600 dark:text-warm-400 font-semibold">
                    {pyq.year}
                  </span>
                )}
                {pyq.board_year && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-semibold">
                    {pyq.board_year}
                  </span>
                )}
              </div>
              <p className="flex-1 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{pyq.question}</p>
              <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 mt-1 ${expandedId === pyq.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedId === pyq.id && pyq.correct_answer && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                <div className="mt-3 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800">
                  <span className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wide">Answer</span>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{pyq.correct_answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
