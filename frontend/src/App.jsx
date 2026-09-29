import { useEffect, useState } from 'react'
import DistanceSummary from './components/DistanceSummary'
import RunList from './components/RunList'
import { getRuns, getSummary } from './services/runApi'

function App() {
  const [runs, setRuns] = useState([])
  const [summary, setSummary] = useState({ totalRuns: 0, totalDistanceKm: 0 })
  const [error, setError] = useState('')

  function loadRuns() {
    return Promise.all([getRuns(), getSummary()])
      .then(([runsData, summaryData]) => {
        setRuns(runsData)
        setSummary(summaryData)
        setError('')
      })
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    loadRuns()
  }, [])

  return (
    <main className="app">
      <h1>10K Run Tracker</h1>
      {error && <p className="error">{error}</p>}
      <DistanceSummary totalDistanceKm={summary.totalDistanceKm} totalRuns={summary.totalRuns} />
      <RunList runs={runs} />
    </main>
  )
}

export default App
