import { useEffect, useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import DistanceSummary from './components/DistanceSummary'
import RunForm from './components/RunForm'
import RunList from './components/RunList'
import RunMap from './components/RunMap'
import { deleteRun, getRuns, getSummary } from './services/runApi'

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

  function handleRunCreated(createdRun) {
    setSelectedRunId(createdRun.id)
    loadRuns()
  }

  function handleDeleteRun(id) {
    deleteRun(id)
      .then(loadRuns)
      .catch((err) => setError(err.message))
  }

  return (
    <main className="app">
      <h1>10K Run Tracker</h1>
      {error && <p className="error">{error}</p>}
      <DistanceSummary totalDistanceKm={summary.totalDistanceKm} totalRuns={summary.totalRuns} />
      {GOOGLE_MAPS_API_KEY ? (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <RunForm onRunCreated={handleRunCreated} />
          <RunMap run={selectedRun} />
        </APIProvider>
      ) : (
        <p className="map-message">
          Google Maps is not configured, so runs cannot be added and the map is hidden. Add
          VITE_GOOGLE_MAPS_API_KEY to frontend/.env.local and restart the dev server.
        </p>
      )}
      <RunList
        runs={runs}
        selectedRunId={selectedRun?.id}
        onSelectRun={setSelectedRunId}
        onDeleteRun={handleDeleteRun}
      />
    </main>
  )
}

export default App
