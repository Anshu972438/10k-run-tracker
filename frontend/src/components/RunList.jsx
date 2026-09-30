import { formatDate, formatTimeAndPace } from '../utils/format'

// Runs arrive newest first, so runs of the same day are next to each other.
function groupByDay(runs) {
  const days = []
  for (const run of runs) {
    const lastDay = days.at(-1)
    if (lastDay?.date === run.runDate) {
      lastDay.runs.push(run)
    } else {
      days.push({ date: run.runDate, runs: [run] })
    }
  }
  return days
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
        <div className="run-days">
          {groupByDay(runs).map((day) => {
            const dayKm = day.runs.reduce((total, run) => total + run.distanceKm, 0)
            return (
              <section key={day.date} className="run-day">
                <a className="day-header" href={`#day/${day.date}`}>
                  <span className="day-date">{formatDate(day.date)}</span>
                  <span className="day-total">
                    {day.runs.length} {day.runs.length === 1 ? 'run' : 'runs'} ·{' '}
                    {dayKm.toFixed(2)} km
                  </span>
                </a>
                <ul>
                  {day.runs.map((run) => (
                    <li key={run.id} className={run.id === selectedRunId ? 'selected' : ''}>
                      <button
                        type="button"
                        className="run-select"
                        onClick={() => onSelectRun(run.id)}
                      >
                        <span>
                          <span className="run-route">
                            {run.startLocation} → {run.endLocation}
                          </span>
                          {formatTimeAndPace(run) && (
                            <span className="run-meta">{formatTimeAndPace(run)}</span>
                          )}
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
              </section>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default RunList
