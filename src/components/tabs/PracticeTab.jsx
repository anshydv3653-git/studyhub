import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { LoadingSpinner, ErrorDisplay } from '../Status'

export default function PracticeTab({ chapterId }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchQuestions() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('id')

        if (error) throw error
        if (!cancelled) {
          setQuestions(data || [])
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchQuestions()
    return () => { cancelled = true }
  }, [chapterId])

  const current = questions[currentIdx]
  const total = questions.length
  const progress = total > 0 ? ((currentIdx + (answered ? 1 : 0)) / total) * 100 : 0

  function handleSelect(option) {
    if (answered) return
    setSelected(option)
    setAnswered(true)
    if (option === current.correct_answer) {
      setScore(s => s + 1)
    }
  }

  function handleNext() {
    if (currentIdx + 1 >= total) {
      setFinished(true)
    } else {
      setCurrentIdx(i => i + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  function handleRestart() {
    setCurrentIdx(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
    setFinished(false)
  }

  if (loading) return <LoadingSpinner text="Loading questions..." />
  if (error) return <ErrorDisplay message={error} />
  if (total === 0) return (
    <div className="text-center py-16">
      <span className="text-5xl block mb-4">❓</span>
      <p className="text-gray-500 dark:text-gray-400">No practice questions available yet.</p>
    </div>
  )

  if (finished) {
    const percentage = Math.round((score / total) * 100)
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">{percentage >= 70 ? '🎉' : percentage >= 40 ? '💪' : '📚'}</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Quiz Complete!</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-1">
          You scored <span className="font-bold text-primary-600 dark:text-primary-400">{score}</span> out of <span className="font-bold">{total}</span>
        </p>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">{percentage}%</p>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-8 max-w-xs mx-auto overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${percentage >= 70 ? 'bg-accent-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  const options = current?.options || []
  const isCorrect = selected === current?.correct_answer

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Question {currentIdx + 1} of {total}
          </span>
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
            Score: {score}/{currentIdx + (answered ? 1 : 0)}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-start gap-3 mb-6">
          <span className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-bold">
            {currentIdx + 1}
          </span>
          <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed pt-1">
            {current?.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {Array.isArray(options) && options.map((option, idx) => {
            const optionLabel = typeof option === 'string' ? option : option?.text || option?.label || JSON.stringify(option)
            const isSelected = selected === optionLabel || selected === option
            const isCorrectOption = current?.correct_answer === optionLabel || current?.correct_answer === option

            let optionClass = 'border-gray-200 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            if (answered) {
              if (isCorrectOption) {
                optionClass = 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
              } else if (isSelected && !isCorrectOption) {
                optionClass = 'border-red-500 bg-red-50 dark:bg-red-900/20'
              } else {
                optionClass = 'border-gray-200 dark:border-gray-700 opacity-50'
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(optionLabel)}
                disabled={answered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${optionClass} ${answered ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    answered && isCorrectOption ? 'border-accent-500 bg-accent-500 text-white' :
                    answered && isSelected ? 'border-red-500 bg-red-500 text-white' :
                    'border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-gray-700 dark:text-gray-200">{optionLabel}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
              <span className={`font-semibold ${isCorrect ? 'text-accent-700 dark:text-accent-400' : 'text-red-700 dark:text-red-400'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            {current?.explanation && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{current.explanation}</p>
            )}
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button
            onClick={handleNext}
            className="mt-6 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            {currentIdx + 1 >= total ? 'See Results' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  )
}
