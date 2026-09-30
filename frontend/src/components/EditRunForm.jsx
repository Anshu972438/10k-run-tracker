import { useState } from 'react'
import DateField from './DateField'
import DurationFields from './DurationFields'
import { splitDuration, toDisplayDate, toDurationSeconds, toIsoDate } from '../utils/runInput'

function EditRunForm({ run, onSave, onCancel }) {
  const [dateText, setDateText] = useState(toDisplayDate(run.runDate))
  const [duration, setDuration] = useState(splitDuration(run.durationSeconds))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const runDate = toIsoDate(dateText)
  const durationSeconds = toDurationSeconds(duration)
  const canSave = runDate !== null && durationSeconds !== undefined && !isSaving

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await onSave({ runDate, durationSeconds })
    } catch (err) {
      setError(err.message)
      setIsSaving(false)
    }
  }

  return (
    <form className="run-form edit-run-form" onSubmit={handleSubmit}>
      <h3>Edit run</h3>
      <p className="edit-run-hint">
        To change the locations, delete this run and add it again, so the distance is recalculated.
      </p>
      <DateField id="edit-run-date" label="Date" value={dateText} onChange={setDateText} />
      <DurationFields
        legend="Time (leave empty if you did not record it)"
        value={duration}
        onChange={setDuration}
      />
      {error && <p className="error">{error}</p>}
      <div className="edit-run-actions">
        <button type="submit" disabled={!canSave}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default EditRunForm
