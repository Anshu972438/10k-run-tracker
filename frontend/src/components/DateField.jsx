import { useRef } from 'react'
import { todayIsoDate } from '../utils/format'
import { toDisplayDate, toIsoDate } from '../utils/runInput'

// A text field for "dd/mm/yyyy" with a calendar button next to it.
function DateField({ id, label, value, onChange }) {
  const inputRef = useRef(null)
  const pickerRef = useRef(null)
  const isoDate = toIsoDate(value)
  const isInvalid = value.trim() !== '' && isoDate === null

  // showPicker() is missing in older browsers and can be blocked; fall back to typing.
  function openPicker() {
    try {
      pickerRef.current.showPicker()
    } catch {
      inputRef.current.focus()
    }
  }

  return (
    <>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="date-field">
        <input
          id={id}
          ref={inputRef}
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/yyyy"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={isInvalid}
        />
        <button
          type="button"
          className="date-picker-button"
          aria-label="Choose date from calendar"
          onClick={openPicker}
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
          ref={pickerRef}
          type="date"
          min="1900-01-01"
          max={todayIsoDate()}
          className="date-picker-input"
          tabIndex={-1}
          aria-hidden="true"
          value={isoDate ?? ''}
          onChange={(event) => onChange(event.target.value ? toDisplayDate(event.target.value) : '')}
        />
      </div>
      {isInvalid && (
        <p className="field-error">Enter a date from 1900 until today as dd/mm/yyyy.</p>
      )}
    </>
  )
}

export default DateField
