// "2026-09-28" alone is parsed as midnight UTC, which shows the previous day in
// time zones west of UTC. Adding a time makes the browser read it as local time.
export function formatDate(runDate, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Date(`${runDate}T00:00:00`).toLocaleDateString(undefined, options)
}

function twoDigits(value) {
  return String(value).padStart(2, '0')
}

// 3725 -> "1:02:05", 1932 -> "32:12"
export function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return hours > 0
    ? `${hours}:${twoDigits(minutes)}:${twoDigits(seconds)}`
    : `${minutes}:${twoDigits(seconds)}`
}

// 344 -> "5:44 /km"
export function formatPace(secondsPerKm) {
  return `${Math.floor(secondsPerKm / 60)}:${twoDigits(secondsPerKm % 60)} /km`
}

// Pace over several runs: total time divided by the distance of the runs that have a time.
// "!= null" (not "!==") also skips runs where the field is missing (undefined).
export function averagePace(runs) {
  const timedRuns = runs.filter((run) => run.durationSeconds != null)
  const seconds = timedRuns.reduce((total, run) => total + run.durationSeconds, 0)
  const km = timedRuns.reduce((total, run) => total + run.distanceKm, 0)
  return km > 0 ? Math.round(seconds / km) : null
}

export function totalDuration(runs) {
  return runs.reduce((total, run) => total + (run.durationSeconds ?? 0), 0)
}
