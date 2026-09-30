import { useEffect, useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import DistanceSummary from './components/DistanceSummary'
import RunList from './components/RunList'
import RunMap from './components/RunMap'
import { getRuns, getSummary } from './services/runApi'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

function App() {
  const [runs, setRuns] = useState([])
  const [summary, setSummary] = useState({ totalRuns: 0, totalDistanceKm: 0 })
  const [selectedRunId, setSelectedRunId] = useState(null)
  const [error, setError] = useState('')

  // Show the clicked run, or the newest run when nothing is selected (or it was deleted).
  const selectedRun = runs.find((run) => run.id === selectedRunId) ?? runs[0]

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
      {GOOGLE_MAPS_API_KEY ? (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <RunMap run={selectedRun} />
        </APIProvider>
      ) : (
        <p className="map-message">
          The map is not available. Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env.local and restart
          the dev server.
        </p>
      )}
      <RunList runs={runs} selectedRunId={selectedRun?.id} onSelectRun={setSelectedRunId} />
    </main>
  )
}

export default App
