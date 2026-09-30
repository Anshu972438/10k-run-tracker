// "2026-09-28" alone is parsed as midnight UTC, which shows the previous day in
// time zones west of UTC. Adding a time makes the browser read it as local time.
function formatDate(runDate) {
  return new Date(`${runDate}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function RunList({ runs, isLoading = false, selectedRunId, onSelectRun, onDeleteRun }) {
  function handleDelete(run) {
    if (window.confirm(`Delete the run from ${run.startLocation} to ${run.endLocation}?`)) {
      onDeleteRun(run.id)
    }
  }

  return (
    <section className="run-list" id="history">
      <h2>Run history</h2>
      {isLoading ? (
        <ul aria-label="Loading runs">
          {[1, 2, 3].map((row) => (
            <li key={row} className="skeleton-row">
              <span className="skeleton" />
            </li>
          ))}
        </ul>
      ) : runs.length === 0 ? (
        <p className="empty-state">No runs yet. Add your first run to get started.</p>
      ) : (
        <ul>
          {runs.map((run) => (
            <li key={run.id} className={run.id === selectedRunId ? 'selected' : ''}>
              <button type="button" className="run-select" onClick={() => onSelectRun(run.id)}>
                <span>
                  <span className="run-route">
                    {run.startLocation} → {run.endLocation}
                  </span>
                  <span className="run-date">{formatDate(run.runDate)}</span>
                </span>
                <span className="run-distance">{run.distanceKm.toFixed(2)} km</span>
              </button>
              <button
                type="button"
                className="run-delete"
                onClick={() => handleDelete(run)}
                aria-label={`Delete run from ${run.startLocation} to ${run.endLocation}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default RunList
