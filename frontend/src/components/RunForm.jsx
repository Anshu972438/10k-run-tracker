import { useState } from 'react'
import LocationSearch from './LocationSearch'
import { createRun } from '../services/runApi'

function RunForm({ onRunCreated }) {
  const [start, setStart] = useState(null)
  const [end, setEnd] = useState(null)
  const [runDate, setRunDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  // Changing the key remounts the search boxes, which clears them after a run is saved.
  const [formKey, setFormKey] = useState(0)

  const canSubmit = start !== null && end !== null && !isSubmitting

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
        runDate: runDate || null,
      })
      setStart(null)
      setEnd(null)
      setRunDate('')
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
      <input
        id="run-date"
        type="date"
        value={runDate}
        onChange={(event) => setRunDate(event.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={!canSubmit}>
        {isSubmitting ? 'Saving...' : 'Add run'}
      </button>
    </form>
  )
}

export default RunForm
