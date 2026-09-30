import { describe, expect, it } from 'vitest'
import { goalProgress, monthCalendar, personalRecords, startOfWeek, weeklyDistance } from './stats'

describe('stats helpers', () => {
  it('splits the total into completed 10Ks and progress to the next one', () => {
    expect(goalProgress(27.35)).toEqual({ completed: 2, progressKm: 7.35 })
    expect(goalProgress(30.01)).toEqual({ completed: 3, progressKm: 0.01 })
    expect(goalProgress(0)).toEqual({ completed: 0, progressKm: 0 })
  })

  it('starts weeks on Monday', () => {
    expect(startOfWeek('2026-09-30')).toBe('2026-09-28')
    expect(startOfWeek('2026-09-28')).toBe('2026-09-28')
    expect(startOfWeek('2026-10-04')).toBe('2026-09-28')
  })

  it('adds up distance per week, including weeks without runs', () => {
    const runs = [
      { runDate: '2026-09-29', distanceKm: 3 },
      { runDate: '2026-09-30', distanceKm: 2 },
      { runDate: '2026-09-15', distanceKm: 4 },
    ]

    const weeks = weeklyDistance(runs, 3, '2026-09-30')

    expect(weeks).toEqual([
      { weekStart: '2026-09-14', km: 4 },
      { weekStart: '2026-09-21', km: 0 },
      { weekStart: '2026-09-28', km: 5 },
    ])
  })

  it('finds the personal records', () => {
    const runs = [
      { id: 1, runDate: '2026-09-29', distanceKm: 5, durationSeconds: 1800, paceSecondsPerKm: 360 },
      { id: 2, runDate: '2026-09-30', distanceKm: 3, durationSeconds: 900, paceSecondsPerKm: 300 },
      { id: 3, runDate: '2026-09-15', distanceKm: 7, durationSeconds: null, paceSecondsPerKm: null },
    ]

    const records = personalRecords(runs)

    expect(records.longestRun.id).toBe(3)
    expect(records.fastestRun.id).toBe(2)
    expect(records.longestTimeRun.id).toBe(1)
    expect(records.bestWeek).toEqual({ weekStart: '2026-09-28', km: 8 })
  })

  it('builds a Monday-first month with the km of each day', () => {
    // September 2026 starts on a Tuesday, so one empty cell comes first.
    const cells = monthCalendar(2026, 8, [{ runDate: '2026-09-02', distanceKm: 4.5 }])

    expect(cells[0]).toBeNull()
    expect(cells[1]).toEqual({ date: '2026-09-01', day: 1, km: 0 })
    expect(cells[2]).toEqual({ date: '2026-09-02', day: 2, km: 4.5 })
    expect(cells.length % 7).toBe(0)
  })
})
