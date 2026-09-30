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

// "20:00 · 5:48 /km", or only "20:00" when there is no pace (start and end at the same place),
// or null when no time was recorded. "!= null" also covers a missing (undefined) field.
export function formatTimeAndPace(run) {
  if (run.durationSeconds == null) {
    return null
  }
  const time = formatDuration(run.durationSeconds)
  return run.paceSecondsPerKm != null ? `${time} · ${formatPace(run.paceSecondsPerKm)}` : time
}

// Pace over several runs: total time divided by the distance of the runs that have a time.
// Runs with 0 km (start and end at the same place) are skipped, since they have no pace.
export function averagePace(runs) {
  const timedRuns = runs.filter((run) => run.durationSeconds != null && run.distanceKm > 0)
  const seconds = timedRuns.reduce((total, run) => total + run.durationSeconds, 0)
  const km = timedRuns.reduce((total, run) => total + run.distanceKm, 0)
  return km > 0 ? Math.round(seconds / km) : null
}

// Today as "YYYY-MM-DD" in the user's own time zone.
export function todayIsoDate() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

export function totalDuration(runs) {
  return runs.reduce((total, run) => total + (run.durationSeconds ?? 0), 0)
}
