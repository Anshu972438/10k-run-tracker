import { toDurationSeconds } from '../utils/runInput'

const FIELDS = [
  { name: 'hours', label: 'Hours', max: 24 },
  { name: 'minutes', label: 'Minutes', max: 59 },
  { name: 'seconds', label: 'Seconds', max: 59 },
]

// Three number boxes for a run's time; value is { hours, minutes, seconds } as strings.
function DurationFields({ legend, value, onChange }) {
  const isInvalid = toDurationSeconds(value) === undefined

  return (
    <>
      <fieldset className="duration-field">
        <legend className="field-label">{legend}</legend>
        {FIELDS.map((field) => (
          <label key={field.name}>
            <span className="duration-label">{field.label}</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max={field.max}
              value={value[field.name]}
              onChange={(event) => onChange({ ...value, [field.name]: event.target.value })}
            />
          </label>
        ))}
      </fieldset>
      {isInvalid && (
        <p className="field-error">
          Enter a time up to 24 hours, with minutes and seconds from 0 to 59.
        </p>
      )}
    </>
  )
}

export default DurationFields
