import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LoadingSpinner, ErrorDisplay } from '../components/Status'
import SubjectCard from '../components/SubjectCard'

export default function HomePage() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchSubjects() {
      setLoading(true)
      try {
        // First find Class 10
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id, name')
          .or('name.eq.Class 10,name.eq.10,name.eq.class 10')
          .limit(1)

        if (classError) throw classError
        
        let classId
        if (classData && classData.length > 0) {
          classId = classData[0].id
        } else {
          // Fallback: try id = 10
          const { data: fallback, error: fbErr } = await supabase
            .from('classes')
            .select('id, name')
            .eq('id', 10)
            .limit(1)
          
          if (!fbErr && fallback && fallback.length > 0) {
            classId = fallback[0].id
          } else {
            // Last fallback: get the first class that has "10" in its name
            const { data: all, error: allErr } = await supabase
              .from('classes')
              .select('id, name')
              .ilike('name', '%10%')
              .limit(1)
            
            if (!allErr && all && all.length > 0) {
              classId = all[0].id
            } else {
              // Absolute last fallback: just use the first class
              const { data: first } = await supabase
                .from('classes')
                .select('id, name')
                .limit(1)
              if (first && first.length > 0) classId = first[0].id
            }
          }
        }

        if (!classId) throw new Error('Class 10 not found in database')

        // Fetch subjects
        const { data: subjectData, error: subjectError } = await supabase
          .from('subject')
          .select('*')
          .eq('class_id', classId)
          .order('name')

        if (subjectError) throw subjectError
        if (!cancelled) setSubjects(subjectData || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSubjects()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">StudyHub</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          Your complete Class 10 exam prep companion 📖
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-8 max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <div className="text-2xl mb-1">📚</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Notes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <div className="text-2xl mb-1">✍️</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Practice</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <div className="text-2xl mb-1">📋</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">PYQs</div>
        </div>
      </div>

      {/* Subjects */}
      {loading && <LoadingSpinner text="Loading subjects..." />}
      {error && <ErrorDisplay message={error} />}
      {!loading && !error && subjects.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-500 dark:text-gray-400">No subjects found for Class 10.</p>
          <p className="text-xs text-gray-400 mt-2">Make sure your Supabase data is set up correctly.</p>
        </div>
      )}
      {!loading && !error && subjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Choose a Subject</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {subjects.map((subject, idx) => (
              <SubjectCard key={subject.id} subject={subject} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
