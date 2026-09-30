import { useEffect, useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import DayPage from './components/DayPage'
import DistanceSummary from './components/DistanceSummary'
import MapsErrorBoundary from './components/MapsErrorBoundary'
import RunForm from './components/RunForm'
import RunList from './components/RunList'
import RunMap from './components/RunMap'
import RunPage from './components/RunPage'
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
  // The page is chosen by the URL hash ("#stats", "#day/2026-09-30", "#run/7"), so the browser
  // back button works without a router.
  const [page, setPage] = useState(window.location.hash)

  // Show the clicked run, or the newest run when nothing is selected (or it was deleted).
  const selectedRun = runs.find((run) => run.id === selectedRunId) ?? runs[0]
  const isStatsPage = page === '#stats'
  const dayPageDate = page.match(/^#day\/(\d{4}-\d{2}-\d{2})$/)?.[1]
  const runPageId = page.match(/^#run\/(\d+)$/)?.[1]
  const runPageRun = runs.find((run) => String(run.id) === runPageId)

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

  // Pages are swapped in place, so scroll ourselves: to the history for "#history", else to the top.
  // This runs after React has drawn the page, when the history element exists.
  useEffect(() => {
    if (page === '#history') {
      document.getElementById('history')?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [page])

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

  // Opening a run also selects it, so the dashboard map shows it when the user goes back.
  function openRun(id) {
    setSelectedRunId(id)
    window.location.hash = `run/${id}`
  }

  function handleDeleteRun(id) {
    deleteRun(id)
      .then(() => {
        setNotice('Run deleted')
        return loadRuns()
      })
      // The run may already be gone (e.g. deleted in another tab): refresh, then explain.
      .catch((err) => loadRuns().then(() => setError(err.message)))
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
          <StatsPage runs={runs} summary={summary} isLoading={isLoading} />
        ) : dayPageDate ? (
          <DayPage date={dayPageDate} runs={runs} isLoading={isLoading} onShowRun={openRun} />
        ) : runPageId ? (
          <RunPage
            run={runPageRun}
            runs={runs}
            summary={summary}
            isLoading={isLoading}
            loadFailed={Boolean(error) && runs.length === 0}
            map={
              GOOGLE_MAPS_API_KEY && runPageRun ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <MapsErrorBoundary
                    fallback={
                      <p className="map-message">
                        The map could not load. Check the Google Maps API key.
                      </p>
                    }
                  >
                    <RunMap run={runPageRun} />
                  </MapsErrorBoundary>
                </APIProvider>
              ) : null
            }
          />
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
                onSelectRun={openRun}
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
