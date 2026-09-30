import StatCard from './StatCard'
import { averagePace, formatDate, formatDuration, formatPace } from '../utils/format'

function formatCoordinates(latitude, longitude) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

// "12 s/km faster than your average (5:50 /km)"
function describePace(run, runs) {
  const average = averagePace(runs)
  if (run.paceSecondsPerKm == null || average === null) {
    return null
  }
  const difference = run.paceSecondsPerKm - average
  if (difference === 0) {
    return `Same as your average pace (${formatPace(average)})`
  }
  const direction = difference < 0 ? 'faster' : 'slower'
  return `${Math.abs(difference)} s/km ${direction} than your average (${formatPace(average)})`
}

// "+1.20 km longer than your average run (2.90 km)"
function describeDistance(run, summary) {
  if (summary.totalRuns === 0) {
    return null
  }
  const average = summary.totalDistanceKm / summary.totalRuns
  const difference = run.distanceKm - average
  const direction = difference >= 0 ? 'longer' : 'shorter'
  return `${Math.abs(difference).toFixed(2)} km ${direction} than your average run (${average.toFixed(2)} km)`
}

function RunPage({ run, runs, summary, isLoading, loadFailed = false, map }) {
  if (isLoading) {
    return (
      <section className="stats-page">
        <span className="skeleton run-page-skeleton" aria-label="Loading run" />
      </section>
    )
  }

  // When loading failed, the error banner above already explains the problem.
  if (!run && loadFailed) {
    return null
  }

  if (!run) {
    return (
      <section className="stats-page">
        <a className="back-link" href="#history">
          ← Back to run history
        </a>
        <p className="empty-state">This run does not exist. It may have been deleted.</p>
      </section>
    )
  }

  const hasTime = run.durationSeconds != null
  // No pace when start and end are the same place: the straight-line distance is 0 km.
  const hasPace = run.paceSecondsPerKm != null
  const speedKmPerHour = hasPace ? run.distanceKm / (run.durationSeconds / 3600) : null
  const paceComparison = describePace(run, runs)
  const distanceComparison = describeDistance(run, summary)

  return (
    <section className="stats-page">
      <a className="back-link" href="#history">
        ← Back to run history
      </a>
      <div>
        <h2>
          {run.startLocation} → {run.endLocation}
        </h2>
        <p className="stats-intro">
          <a className="inline-link" href={`#day/${run.runDate}`}>
            {formatDate(run.runDate, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </a>
        </p>
      </div>
      <div className="stats-grid">
        <StatCard label="Distance" value={`${run.distanceKm.toFixed(2)} km`} />
        <StatCard label="Time" value={hasTime ? formatDuration(run.durationSeconds) : '–'} />
        <StatCard label="Pace" value={hasPace ? formatPace(run.paceSecondsPerKm) : '–'} />
        <StatCard
          label="Average speed"
          value={speedKmPerHour !== null ? `${speedKmPerHour.toFixed(1)} km/h` : '–'}
        />
      </div>
      {!hasTime && (
        <p className="run-page-note">
          No time was recorded for this run, so pace and speed are not available.
        </p>
      )}
      {hasTime && !hasPace && (
        <p className="run-page-note">
          Start and end are the same place, so the straight-line distance is 0 km and pace and
          speed cannot be calculated.
        </p>
      )}
      {(paceComparison || distanceComparison) && (
        <section className="month-list">
          <h3>Compared to your other runs</h3>
          <ul className="comparison-list">
            {distanceComparison && <li>{distanceComparison}</li>}
            {paceComparison && <li>{paceComparison}</li>}
          </ul>
        </section>
      )}
      <div className="run-page-body">
        <div className="run-page-map">{map}</div>
        <section className="month-list">
          <h3>Route</h3>
          <dl className="route-points">
            <div>
              <dt>
                <span className="route-pin route-pin-start">S</span> Start
              </dt>
              <dd>{run.startLocation}</dd>
              <dd className="route-coordinates">
                {formatCoordinates(run.startLatitude, run.startLongitude)}
              </dd>
            </div>
            <div>
              <dt>
                <span className="route-pin route-pin-end">E</span> End
              </dt>
              <dd>{run.endLocation}</dd>
              <dd className="route-coordinates">
                {formatCoordinates(run.endLatitude, run.endLongitude)}
              </dd>
            </div>
          </dl>
          <p className="route-note">
            Distance is the straight line between start and end (Haversine formula).
          </p>
        </section>
      </div>
    </section>
  )
}

export default RunPage
