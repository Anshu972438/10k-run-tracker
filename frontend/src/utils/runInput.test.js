import { describe, expect, it } from 'vitest'
import { splitDuration, toDisplayDate, toDurationSeconds, toIsoDate } from './runInput'

describe('run input helpers', () => {
  it('converts typed dates to ISO and back', () => {
    expect(toIsoDate('5/9/2026')).toBe('2026-09-05')
    expect(toIsoDate('31/02/2026')).toBeNull()
    expect(toIsoDate('01/01/1899')).toBeNull()
    expect(toDisplayDate('2026-09-05')).toBe('05/09/2026')
  })

  it('converts time fields to seconds and back', () => {
    expect(toDurationSeconds({ hours: '1', minutes: '2', seconds: '5' })).toBe(3725)
    expect(toDurationSeconds({ hours: '', minutes: '', seconds: '' })).toBeNull()
    expect(toDurationSeconds({ hours: '25', minutes: '', seconds: '' })).toBeUndefined()
    expect(splitDuration(3725)).toEqual({ hours: '1', minutes: '2', seconds: '5' })
    expect(splitDuration(1930)).toEqual({ hours: '', minutes: '32', seconds: '10' })
    expect(splitDuration(null)).toEqual({ hours: '', minutes: '', seconds: '' })
  })
})
