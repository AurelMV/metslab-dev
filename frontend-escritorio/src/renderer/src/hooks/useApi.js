import { useState, useCallback } from 'react'

export function useApi() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (url, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(url, options)
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Error en la petición')
      setData(result)
      return result
    } catch (err) {
      setError(err)
      setData(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, request }
}
