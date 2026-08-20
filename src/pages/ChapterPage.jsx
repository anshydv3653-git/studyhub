import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LoadingSpinner, ErrorDisplay } from '../components/Status'
import NotesTab from '../components/tabs/NotesTab'
import PracticeTab from '../components/tabs/PracticeTab'
import PYQTab from '../components/tabs/PYQTab'
import NCERTTab from '../components/tabs/NCERTTab'
import DiagramsTab from '../components/tabs/DiagramsTab'

const tabs = [
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'practice', label: 'Practice', icon: '✍️' },
  { id: 'pyqs', label: 'PYQs', icon: '📋' },
  { id: 'ncert', label: 'NCERT Q&A', icon: '📚' },
  { id: 'diagrams', label: 'Diagrams', icon: '🎨' },
]

export default function ChapterPage() {
  const { chapterId } = useParams()
  const [chapter, setChapter] = useState(null)
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('notes')

  useEffect(() => {
    let cancelled = false

    async function fetchChapter() {
      setLoading(true)
      try {
        const { data: chapterData, error: chapterError } = await supabase
          .from('chapters')
          .select('*, subject:subject_id(*)')
          .eq('id', chapterId)
          .single()

        if (chapterError) throw chapterError
        if (!cancelled) {
          setChapter(chapterData)
          setSubject(chapterData?.subject || null)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchChapter()
    return () => { cancelled = true }
  }, [chapterId])

  if (loading) return <LoadingSpinner text="Loading chapter..." />
  if (error) return <ErrorDisplay message={error} />

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap">
        <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {subject && (
          <>
            <Link to={`/subject/${subject.id}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {subject.name}
            </Link>
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
        <span className="text-gray-800 dark:text-gray-200 font-medium truncate">{chapter?.name}</span>
      </nav>

      {/* Chapter title */}
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {chapter?.name}
      </h1>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === 'notes' && <NotesTab chapterId={parseInt(chapterId)} />}
        {activeTab === 'practice' && <PracticeTab chapterId={parseInt(chapterId)} />}
        {activeTab === 'pyqs' && <PYQTab chapterId={parseInt(chapterId)} />}
        {activeTab === 'ncert' && <NCERTTab chapterId={parseInt(chapterId)} />}
        {activeTab === 'diagrams' && <DiagramsTab chapterId={parseInt(chapterId)} />}
      </div>
    </div>
  )
}
