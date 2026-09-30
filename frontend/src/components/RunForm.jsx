import { useState } from 'react'
import DateField from './DateField'
import DurationFields from './DurationFields'
import LocationSearch from './LocationSearch'
import { createRun } from '../services/runApi'
import { toDurationSeconds, toIsoDate } from '../utils/runInput'

const EMPTY_DURATION = { hours: '', minutes: '', seconds: '' }

function RunForm({ onRunCreated }) {
  const [start, setStart] = useState(null)
  const [end, setEnd] = useState(null)
  const [dateText, setDateText] = useState('')
  const [duration, setDuration] = useState(EMPTY_DURATION)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  // Changing the key remounts the search boxes, which clears them after a run is saved.
  const [formKey, setFormKey] = useState(0)

  const runDate = toIsoDate(dateText)
  const isDateInvalid = dateText.trim() !== '' && runDate === null
  const durationSeconds = toDurationSeconds(duration)
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
      setDuration(EMPTY_DURATION)
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
      <DateField
        id="run-date"
        label="Date (optional, defaults to today)"
        value={dateText}
        onChange={setDateText}
      />
      <DurationFields
        legend="Time (optional, used for your pace)"
        value={duration}
        onChange={setDuration}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={!canSubmit}>
        {isSubmitting ? 'Saving...' : 'Add run'}
      </button>
    </form>
  )
}

export default RunForm
