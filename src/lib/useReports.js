import { useCallback, useEffect, useState } from 'react'
import { fetchReports } from './api'
import { APPS_SCRIPT_URL } from './config'

export function useReports(type) {
  const [rows, setRows] = useState([])
  const [state, setState] = useState(APPS_SCRIPT_URL ? 'loading' : 'not-configured')

  const load = useCallback(async () => {
    if (!APPS_SCRIPT_URL) {
      setState('not-configured')
      return
    }
    setState((s) => (s === 'loaded' ? 'refreshing' : 'loading'))
    try {
      const data = await fetchReports(type)
      setRows(data)
      setState('loaded')
    } catch {
      setState('error')
    }
  }, [type])

  useEffect(() => {
    load()
  }, [load])

  return { rows, state, reload: load }
}
