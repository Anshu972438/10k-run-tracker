import { describe, expect, it } from 'vitest'
import { averagePace, formatDuration, formatPace, totalDuration } from './format'

describe('format helpers', () => {
  it('formats durations with and without hours', () => {
    expect(formatDuration(1932)).toBe('32:12')
    expect(formatDuration(3725)).toBe('1:02:05')
  })

  it('formats pace as minutes and seconds per km', () => {
    expect(formatPace(344)).toBe('5:44 /km')
    expect(formatPace(300)).toBe('5:00 /km')
  })

  it('calculates average pace only from runs that have a time', () => {
    const runs = [
      { distanceKm: 5, durationSeconds: 1500 },
      { distanceKm: 5, durationSeconds: 1800 },
      { distanceKm: 10, durationSeconds: null },
    ]

    expect(averagePace(runs)).toBe(330)
    expect(totalDuration(runs)).toBe(3300)
  })

  it('has no average pace when no run has a time', () => {
    expect(averagePace([{ distanceKm: 5, durationSeconds: null }])).toBeNull()
  })
})
