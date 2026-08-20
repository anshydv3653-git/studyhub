import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { LoadingSpinner, ErrorDisplay } from '../Status'

export default function DiagramsTab({ chapterId }) {
  const [diagrams, setDiagrams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDiagram, setSelectedDiagram] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchDiagrams() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('diagrams')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('id')

        if (error) throw error
        if (!cancelled) setDiagrams(data || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDiagrams()
    return () => { cancelled = true }
  }, [chapterId])

  if (loading) return <LoadingSpinner text="Loading diagrams..." />
  if (error) return <ErrorDisplay message={error} />
  if (diagrams.length === 0) return (
    <div className="text-center py-16">
      <span className="text-5xl block mb-4">🎨</span>
      <p className="text-gray-500 dark:text-gray-400">No diagrams available for this chapter yet.</p>
    </div>
  )

  return (
    <div>
      {/* Grid view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {diagrams.map(diagram => (
          <button
            key={diagram.id}
            onClick={() => setSelectedDiagram(diagram)}
            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="aspect-video bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full group-hover:scale-105 transition-transform duration-300"
                dangerouslySetInnerHTML={{ __html: diagram.svg_code || '' }}
              />
            </div>
            <div className="p-3">
              <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                {diagram.title || diagram.diagram_key || 'Untitled'}
              </h4>
              {diagram.is_animated && (
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 font-semibold">
                  ✨ Animated
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Modal for full view */}
      {selectedDiagram && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedDiagram(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  {selectedDiagram.title || selectedDiagram.diagram_key || 'Diagram'}
                </h3>
                {selectedDiagram.is_animated && (
                  <span className="text-xs text-accent-600 dark:text-accent-400 font-medium">✨ Animated</span>
                )}
              </div>
              <button
                onClick={() => setSelectedDiagram(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex items-center justify-center min-h-[300px] bg-gray-50 dark:bg-gray-900">
              <div
                className="w-full [&>svg]:max-w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: selectedDiagram.svg_code || '' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
