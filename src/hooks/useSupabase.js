import { useState, useEffect } from 'react'

export function useSupabase(queryFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    queryFn()
      .then(result => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'An error occurred')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, deps)

  return { data, loading, error }
}
