import StatCard from './StatCard'
import { averagePace, formatDate, formatDuration, formatPace, totalDuration } from '../utils/format'

function DayPage({ date, runs, onShowRun }) {
  const dayRuns = runs.filter((run) => run.runDate === date)
  const dayKm = dayRuns.reduce((total, run) => total + run.distanceKm, 0)
  const dayDuration = totalDuration(dayRuns)
  const dayPace = averagePace(dayRuns)

  return (
    <section className="stats-page">
      <a className="back-link" href="#history">
        ← Back to run history
      </a>
      <div>
        <h2>
          {formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>
        <p className="stats-intro">Summary of this day.</p>
      </div>
      {dayRuns.length === 0 ? (
        <p className="empty-state">No runs on this day.</p>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Distance" value={`${dayKm.toFixed(2)} km`} />
            <StatCard label="Runs" value={dayRuns.length} />
            <StatCard label="Time" value={dayDuration > 0 ? formatDuration(dayDuration) : '–'} />
            <StatCard label="Average pace" value={dayPace !== null ? formatPace(dayPace) : '–'} />
          </div>
          <section className="month-list">
            <h3>Runs</h3>
            <ul className="day-runs">
              {dayRuns.map((run) => (
                <li key={run.id}>
                  <button type="button" className="day-run" onClick={() => onShowRun(run.id)}>
                    <span>
                      <span className="run-route">
                        {run.startLocation} → {run.endLocation}
                      </span>
                      <span className="run-meta">
                        {run.durationSeconds != null
                          ? `${formatDuration(run.durationSeconds)} · ${formatPace(run.paceSecondsPerKm)}`
                          : 'No time recorded'}
                      </span>
                    </span>
                    <span className="run-distance">{run.distanceKm.toFixed(2)} km</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </section>
  )
}

export default DayPage
