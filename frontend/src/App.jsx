import { useEffect, useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import DistanceSummary from './components/DistanceSummary'
import MapsErrorBoundary from './components/MapsErrorBoundary'
import RunForm from './components/RunForm'
import RunList from './components/RunList'
import RunMap from './components/RunMap'
import StatsPage from './components/StatsPage'
import { deleteRun, getRuns, getSummary } from './services/runApi'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

function App() {
  const [runs, setRuns] = useState([])
  const [summary, setSummary] = useState({ totalRuns: 0, totalDistanceKm: 0 })
  const [selectedRunId, setSelectedRunId] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')
  // The page is chosen by the URL hash ("#stats"), so the browser back button works without a router.
  const [page, setPage] = useState(window.location.hash)

  // Show the clicked run, or the newest run when nothing is selected (or it was deleted).
  const selectedRun = runs.find((run) => run.id === selectedRunId) ?? runs[0]
  const isStatsPage = page === '#stats'

  function loadRuns() {
    return Promise.all([getRuns(), getSummary()])
      .then(([runsData, summaryData]) => {
        setRuns(runsData)
        setSummary(summaryData)
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadRuns()
  }, [])

  // Hide the "Run added" / "Run deleted" message after a few seconds.
  useEffect(() => {
    if (!notice) {
      return
    }
    const timer = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    function handleHashChange() {
      setPage(window.location.hash)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function handleRunCreated(createdRun) {
    setSelectedRunId(createdRun.id)
    setNotice('Run added')
    loadRuns()
  }

  function handleDeleteRun(id) {
    deleteRun(id)
      .then(() => {
        setNotice('Run deleted')
        return loadRuns()
      })
      .catch((err) => setError(err.message))
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <span className="brand-mark">10K</span>
          <div>
            <h1>10K Run Tracker</h1>
            <p className="app-tagline">Log your runs and watch the kilometers add up.</p>
          </div>
          <nav className="app-nav">
            <a href="#" className={isStatsPage ? '' : 'active'}>
              Dashboard
            </a>
            <a href="#stats" className={isStatsPage ? 'active' : ''}>
              Statistics
            </a>
          </nav>
        </div>
      </header>
      <main className="app">
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {isStatsPage ? (
          <StatsPage runs={runs} summary={summary} />
        ) : (
          <>
            <DistanceSummary
              totalDistanceKm={summary.totalDistanceKm}
              totalRuns={summary.totalRuns}
              isLoading={isLoading}
            />
            <div className="layout">
              {GOOGLE_MAPS_API_KEY ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <MapsErrorBoundary
                    fallback={
                      <p className="run-form form-message">
                        Location search could not load. Check the Google Maps API key.
                      </p>
                    }
                  >
                    <RunForm onRunCreated={handleRunCreated} />
                  </MapsErrorBoundary>
                  <MapsErrorBoundary
                    fallback={
                      <p className="map-message">
                        The map could not load. Check the Google Maps API key.
                      </p>
                    }
                  >
                    <RunMap run={selectedRun} />
                  </MapsErrorBoundary>
                </APIProvider>
              ) : (
                <p className="map-message">
                  Google Maps is not configured, so runs cannot be added and the map is hidden. Add
                  VITE_GOOGLE_MAPS_API_KEY to frontend/.env.local and restart the dev server.
                </p>
              )}
              <RunList
                runs={runs}
                isLoading={isLoading}
                selectedRunId={selectedRun?.id}
                onSelectRun={setSelectedRunId}
                onDeleteRun={handleDeleteRun}
              />
            </div>
          </>
        )}
      </main>
      {notice && (
        <p className="toast" role="status">
          {notice}
        </p>
      )}
    </>
  )
}

export default App
