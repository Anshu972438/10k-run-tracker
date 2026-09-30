import RunCalendar from './RunCalendar'
import StatCard from './StatCard'
import WeeklyChart from './WeeklyChart'
import { averagePace, formatDate, formatDuration, formatPace, totalDuration } from '../utils/format'
import { personalRecords } from '../utils/stats'

function formatMonth(month) {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

function StatsPage({ runs, summary, isLoading = false }) {
  if (isLoading) {
    return (
      <section className="stats-page">
        <span className="skeleton run-page-skeleton" aria-label="Loading statistics" />
      </section>
    )
  }

  const averageKm = summary.totalRuns > 0 ? summary.totalDistanceKm / summary.totalRuns : 0
  const totalSeconds = totalDuration(runs)
  const pace = averagePace(runs)
  const records = personalRecords(runs)

  // runDate is "YYYY-MM-DD", so the first 7 characters are the month.
  const kmByMonth = {}
  for (const run of runs) {
    const month = run.runDate.slice(0, 7)
    kmByMonth[month] = (kmByMonth[month] ?? 0) + run.distanceKm
  }
  const months = Object.entries(kmByMonth).sort(([a], [b]) => b.localeCompare(a))
  const maxMonthKm = Math.max(...months.map(([, km]) => km))

  return (
    <section className="stats-page">
      <a className="back-link" href="#">
        ← Back to dashboard
      </a>
      <div>
        <h2>Statistics</h2>
        <p className="stats-intro">How your runs add up.</p>
      </div>
      {runs.length === 0 ? (
        <p className="empty-state">No runs yet. Add your first run to see statistics.</p>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Total distance" value={`${summary.totalDistanceKm.toFixed(2)} km`} />
            <StatCard label="Runs" value={summary.totalRuns} />
            <StatCard label="Average per run" value={`${averageKm.toFixed(2)} km`} />
            <StatCard
              label="Total time"
              value={totalSeconds > 0 ? formatDuration(totalSeconds) : '–'}
            />
            <StatCard
              label="Average pace"
              value={pace !== null ? formatPace(pace) : '–'}
              detail="Runs with a recorded time"
            />
          </div>
          <div className="stats-columns">
            <WeeklyChart runs={runs} />
            <RunCalendar runs={runs} />
          </div>
          <section className="month-list">
            <h3>Personal records</h3>
            <div className="stats-grid records-grid">
              <StatCard
                label="Longest run"
                value={`${records.longestRun.distanceKm.toFixed(2)} km`}
                detail={`${records.longestRun.startLocation} → ${records.longestRun.endLocation}`}
              />
              <StatCard
                label="Fastest pace"
                value={records.fastestRun ? formatPace(records.fastestRun.paceSecondsPerKm) : '–'}
                detail={
                  records.fastestRun
                    ? `${records.fastestRun.startLocation} → ${records.fastestRun.endLocation}`
                    : 'Add a time to your runs'
                }
              />
              <StatCard
                label="Longest time"
                value={
                  records.longestTimeRun ? formatDuration(records.longestTimeRun.durationSeconds) : '–'
                }
                detail={
                  records.longestTimeRun
                    ? `${records.longestTimeRun.startLocation} → ${records.longestTimeRun.endLocation}`
                    : 'Add a time to your runs'
                }
              />
              <StatCard
                label="Best week"
                value={`${records.bestWeek.km.toFixed(2)} km`}
                detail={`Week of ${formatDate(records.bestWeek.weekStart, { day: 'numeric', month: 'long' })}`}
              />
            </div>
          </section>
          <section className="month-list">
            <h3>Distance by month</h3>
            <ul>
              {months.map(([month, km]) => (
                <li key={month}>
                  <span className="month-name">{formatMonth(month)}</span>
                  <span className="month-bar">
                    <span style={{ width: `${(km / maxMonthKm) * 100}%` }} />
                  </span>
                  <span className="month-km">{km.toFixed(2)} km</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </section>
  )
}

export default StatsPage
