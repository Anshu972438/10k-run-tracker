import { useRef, useState } from 'react'
import LocationSearch from './LocationSearch'
import { createRun } from '../services/runApi'

// Turns "28/09/2026" into "2026-09-28" (the format the API expects),
// or returns null when the text is not a real date.
function toIsoDate(text) {
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
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function toDisplayDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

// Empty fields mean "no time recorded". Returns undefined when the input is not valid.
function toDurationSeconds(hours, minutes, seconds) {
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

function RunForm({ onRunCreated }) {
  const [start, setStart] = useState(null)
  const [end, setEnd] = useState(null)
  const [dateText, setDateText] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  // Changing the key remounts the search boxes, which clears them after a run is saved.
  const [formKey, setFormKey] = useState(0)
  const datePickerRef = useRef(null)

  const runDate = toIsoDate(dateText)
  const isDateInvalid = dateText.trim() !== '' && runDate === null
  const durationSeconds = toDurationSeconds(hours, minutes, seconds)
  const isDurationInvalid = durationSeconds === undefined
  const canSubmit =
    start !== null && end !== null && !isDateInvalid && !isDurationInvalid && !isSubmitting

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const createdRun = await createRun({
        startLocation: start.name,
        startLatitude: start.latitude,
        startLongitude: start.longitude,
        endLocation: end.name,
        endLatitude: end.latitude,
        endLongitude: end.longitude,
        runDate,
        durationSeconds,
      })
      setStart(null)
      setEnd(null)
      setDateText('')
      setHours('')
      setMinutes('')
      setSeconds('')
      setFormKey((key) => key + 1)
      onRunCreated(createdRun)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="run-form" onSubmit={handleSubmit}>
      <h2>Add a run</h2>
      <LocationSearch key={`start-${formKey}`} label="Start location" onSelect={setStart} />
      <LocationSearch key={`end-${formKey}`} label="End location" onSelect={setEnd} />
      <label className="field-label" htmlFor="run-date">
        Date (optional, defaults to today)
      </label>
      <div className="date-field">
        <input
          id="run-date"
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/yyyy"
          value={dateText}
          onChange={(event) => setDateText(event.target.value)}
          aria-invalid={isDateInvalid}
        />
        <button
          type="button"
          className="date-picker-button"
          aria-label="Choose date from calendar"
          onClick={() => datePickerRef.current.showPicker()}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm-2 7h14v10H5V9z"
            />
          </svg>
        </button>
        {/* Hidden native date input: it only provides the browser's calendar popup. */}
        <input
          ref={datePickerRef}
          type="date"
          className="date-picker-input"
          tabIndex={-1}
          aria-hidden="true"
          value={runDate ?? ''}
          onChange={(event) =>
            setDateText(event.target.value ? toDisplayDate(event.target.value) : '')
          }
        />
      </div>
      {isDateInvalid && <p className="field-error">Enter a valid date as dd/mm/yyyy.</p>}
      <fieldset className="duration-field">
        <legend className="field-label">Time (optional, used for your pace)</legend>
        <label>
          <span className="duration-label">Hours</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="24"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
          />
        </label>
        <label>
          <span className="duration-label">Minutes</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="59"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
          />
        </label>
        <label>
          <span className="duration-label">Seconds</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="59"
            value={seconds}
            onChange={(event) => setSeconds(event.target.value)}
          />
        </label>
      </fieldset>
      {isDurationInvalid && (
        <p className="field-error">
          Enter a time up to 24 hours, with minutes and seconds from 0 to 59.
        </p>
      )}
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={!canSubmit}>
        {isSubmitting ? 'Saving...' : 'Add run'}
      </button>
    </form>
  )
}

export default RunForm
