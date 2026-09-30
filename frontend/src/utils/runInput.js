import { todayIsoDate } from './format'

// Turns "28/09/2026" into "2026-09-28" (the format the API expects), or returns null when the
// text is not a real date between 1900 and today (the API also rejects future dates).
export function toIsoDate(text) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim())
  if (!match) {
    return null
  }
  const [, day, month, year] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  // new Date() silently rolls 31/02 over to 03/03, so check the parts are unchanged.
  if (date.getDate() !== Number(day) || date.getMonth() !== Number(month) - 1) {
    return null
  }
  const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  // ISO dates compare correctly as plain strings.
  if (Number(year) < 1900 || isoDate > todayIsoDate()) {
    return null
  }
  return isoDate
}

export function toDisplayDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

// Empty fields mean "no time recorded". Returns undefined when the input is not valid.
export function toDurationSeconds({ hours, minutes, seconds }) {
  if (hours === '' && minutes === '' && seconds === '') {
    return null
  }
  const [h, m, s] = [hours, minutes, seconds].map((value) => (value === '' ? 0 : Number(value)))
  const isWholeNumber = [h, m, s].every((value) => Number.isInteger(value) && value >= 0)
  const totalSeconds = h * 3600 + m * 60 + s
  // The API accepts 1 second up to 24 hours; check it here so the user gets a clear message.
  if (!isWholeNumber || m > 59 || s > 59 || totalSeconds === 0 || totalSeconds > 86400) {
    return undefined
  }
  return totalSeconds
}

// 1930 -> { hours: '', minutes: '32', seconds: '10' }, so the form can be filled in for editing.
export function splitDuration(totalSeconds) {
  if (totalSeconds == null) {
    return { hours: '', minutes: '', seconds: '' }
  }
  const hours = Math.floor(totalSeconds / 3600)
  return {
    hours: hours > 0 ? String(hours) : '',
    minutes: String(Math.floor((totalSeconds % 3600) / 60)),
    seconds: String(totalSeconds % 60),
  }
}
