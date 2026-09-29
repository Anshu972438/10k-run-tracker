// "2026-09-28" alone is parsed as midnight UTC, which shows the previous day in
// time zones west of UTC. Adding a time makes the browser read it as local time.
function formatDate(runDate) {
  return new Date(`${runDate}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function RunList({ runs }) {
  return (
    <section className="run-list">
      <h2>Run history</h2>
      {runs.length === 0 ? (
        <p className="empty-state">No runs yet. Add your first run to get started.</p>
      ) : (
        <ul>
          {runs.map((run) => (
            <li key={run.id}>
              <div>
                <p className="run-route">
                  {run.startLocation} → {run.endLocation}
                </p>
                <p className="run-date">{formatDate(run.runDate)}</p>
              </div>
              <p className="run-distance">{run.distanceKm.toFixed(2)} km</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default RunList
