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

function RunForm({ onRunCreated }) {
  const [start, setStart] = useState(null)
  const [end, setEnd] = useState(null)
  const [dateText, setDateText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  // Changing the key remounts the search boxes, which clears them after a run is saved.
  const [formKey, setFormKey] = useState(0)
  const datePickerRef = useRef(null)

  const runDate = toIsoDate(dateText)
  const isDateInvalid = dateText.trim() !== '' && runDate === null
  const canSubmit = start !== null && end !== null && !isDateInvalid && !isSubmitting

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
      })
      setStart(null)
      setEnd(null)
      setDateText('')
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
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={!canSubmit}>
        {isSubmitting ? 'Saving...' : 'Add run'}
      </button>
    </form>
  )
}

export default RunForm
