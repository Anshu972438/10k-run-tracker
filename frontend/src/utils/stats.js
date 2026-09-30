import { todayIsoDate } from './format'

function parseIsoDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`)
}

function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function sumBy(runs, keyOf) {
  const totals = {}
  for (const run of runs) {
    const key = keyOf(run)
    totals[key] = (totals[key] ?? 0) + run.distanceKm
  }
  return totals
}

// 27.35 km -> 2 full 10Ks done and 7.35 km towards the next one.
// Whole hundredths avoid floating point leftovers like 7.349999.
export function goalProgress(totalDistanceKm) {
  const hundredths = Math.round(totalDistanceKm * 100)
  return {
    completed: Math.floor(hundredths / 1000),
    progressKm: (hundredths % 1000) / 100,
  }
}

// Weeks start on Monday: "2026-09-30" (a Wednesday) -> "2026-09-28".
export function startOfWeek(isoDate) {
  const date = parseIsoDate(isoDate)
  const daysSinceMonday = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - daysSinceMonday)
  return toIsoDate(date)
}

// Distance per week for the last weeks up to this week, including weeks without runs.
export function weeklyDistance(runs, weekCount = 8, today = todayIsoDate()) {
  const kmByWeek = sumBy(runs, (run) => startOfWeek(run.runDate))
  const thisWeek = parseIsoDate(startOfWeek(today))
  const weeks = []
  for (let weeksAgo = weekCount - 1; weeksAgo >= 0; weeksAgo--) {
    const weekStart = new Date(thisWeek)
    weekStart.setDate(weekStart.getDate() - weeksAgo * 7)
    const key = toIsoDate(weekStart)
    weeks.push({ weekStart: key, km: kmByWeek[key] ?? 0 })
  }
  return weeks
}

function best(items, isBetter) {
  return items.reduce((current, item) => (current === null || isBetter(item, current) ? item : current), null)
}

export function personalRecords(runs) {
  const timedRuns = runs.filter((run) => run.durationSeconds != null)
  const pacedRuns = runs.filter((run) => run.paceSecondsPerKm != null)
  const weeks = Object.entries(sumBy(runs, (run) => startOfWeek(run.runDate))).map(
    ([weekStart, km]) => ({ weekStart, km }),
  )
  return {
    longestRun: best(runs, (a, b) => a.distanceKm > b.distanceKm),
    fastestRun: best(pacedRuns, (a, b) => a.paceSecondsPerKm < b.paceSecondsPerKm),
    longestTimeRun: best(timedRuns, (a, b) => a.durationSeconds > b.durationSeconds),
    bestWeek: best(weeks, (a, b) => a.km > b.km),
  }
}

// The days of one month for a calendar that starts on Monday. Empty cells (null) fill the
// days before the 1st and after the last day, so every row has 7 cells.
export function monthCalendar(year, month, runs) {
  const kmByDay = sumBy(runs, (run) => run.runDate)
  const daysBefore = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array(daysBefore).fill(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const date = toIsoDate(new Date(year, month, day))
    cells.push({ date, day, km: kmByDay[date] ?? 0 })
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }
  return cells
}
