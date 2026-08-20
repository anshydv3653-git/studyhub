import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LoadingSpinner, ErrorDisplay } from '../components/Status'
import { getSubjectIcon, getSubjectColor } from '../components/SubjectCard'

export default function SubjectPage() {
  const { subjectId } = useParams()
  const [subject, setSubject] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      try {
        const [subjectRes, chaptersRes] = await Promise.all([
          supabase.from('subject').select('*').eq('id', subjectId).single(),
          supabase.from('chapters').select('*').eq('subject_id', subjectId).order('id')
        ])

        if (subjectRes.error) throw subjectRes.error
        if (chaptersRes.error) throw chaptersRes.error

        if (!cancelled) {
          setSubject(subjectRes.data)
          setChapters(chaptersRes.data || [])
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [subjectId])

  if (loading) return <LoadingSpinner text="Loading chapters..." />
  if (error) return <ErrorDisplay message={error} />

  const icon = getSubjectIcon(subject?.name)
  const colorIdx = parseInt(subjectId) || 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{subject?.name}</span>
      </nav>

      {/* Header */}
      <div className={`bg-gradient-to-r ${getSubjectColor(colorIdx)} rounded-2xl p-6 mb-8 text-white`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{subject?.name}</h1>
            <p className="text-white/80 text-sm">{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Chapters list */}
      {chapters.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-500 dark:text-gray-400">No chapters available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter, idx) => (
            <Link
              key={chapter.id}
              to={`/chapter/${chapter.id}`}
              className="group flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200"
            >
              <span className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-bold text-sm transition-colors">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                  {chapter.name}
                </h3>
              </div>
              <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
