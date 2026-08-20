import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { LoadingSpinner, ErrorDisplay } from '../Status'

export default function NotesTab({ chapterId }) {
  const [notes, setNotes] = useState([])
  const [diagrams, setDiagrams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedNote, setExpandedNote] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const [notesRes, diagramsRes] = await Promise.all([
          supabase.from('notes').select('*').eq('chapter_id', chapterId).order('id'),
          supabase.from('diagrams').select('*').eq('chapter_id', chapterId)
        ])

        if (notesRes.error) throw notesRes.error
        if (diagramsRes.error) throw diagramsRes.error

        if (!cancelled) {
          setNotes(notesRes.data || [])
          setDiagrams(diagramsRes.data || [])
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [chapterId])

  if (loading) return <LoadingSpinner text="Loading notes..." />
  if (error) return <ErrorDisplay message={error} />
  if (notes.length === 0) return (
    <div className="text-center py-16">
      <span className="text-5xl block mb-4">📝</span>
      <p className="text-gray-500 dark:text-gray-400">No notes available for this chapter yet.</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {notes.map((note, idx) => (
        <div key={note.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setExpandedNote(expandedNote === idx ? null : idx)}
            className="w-full text-left p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-bold">
                {idx + 1}
              </span>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">{note.title || `Note ${idx + 1}`}</h3>
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedNote === idx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedNote === idx && (
            <div className="px-5 pb-6 border-t border-gray-100 dark:border-gray-700">
              {/* Note content */}
              <div className="prose prose-sm dark:prose-invert max-w-none mt-4 leading-relaxed">
                {note.fully_explained_notes ? (
                  <div
                    className="note-content text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: note.fully_explained_notes }}
                  />
                ) : note.content ? (
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</div>
                ) : (
                  <p className="text-gray-400 italic">No content available.</p>
                )}
              </div>

              {/* Inline diagrams for this note */}
              {diagrams.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    📊 Diagrams
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {diagrams.map(diagram => (
                      <div key={diagram.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div
                          className="flex items-center justify-center min-h-[120px]"
                          dangerouslySetInnerHTML={{ __html: diagram.svg_code || '' }}
                        />
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 font-medium">
                          {diagram.title}
                        </p>
                        {diagram.is_animated && (
                          <span className="inline-block mx-auto mt-1 text-[10px] px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400">
                            Animated
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
