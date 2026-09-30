import { useEffect, useRef, useState } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'

function LocationSearch({ label, onSelect }) {
  const places = useMapsLibrary('places')
  const containerRef = useRef(null)
  const onSelectRef = useRef(onSelect)
  const [error, setError] = useState('')

  // Keep the latest callback without re-creating the Google search box on every render.
  useEffect(() => {
    onSelectRef.current = onSelect
  })

  useEffect(() => {
    if (!places) {
      return
    }

    const autocomplete = new places.PlaceAutocompleteElement()
    containerRef.current.append(autocomplete)

    async function handleSelect({ placePrediction }) {
      try {
        const place = placePrediction.toPlace()
        await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] })
        setError('')
        onSelectRef.current({
          name: place.displayName ?? place.formattedAddress,
          latitude: place.location.lat(),
          longitude: place.location.lng(),
        })
      } catch {
        setError('Could not load this place. Please try again.')
        onSelectRef.current(null)
      }
    }

    // Typing again after picking a place means the old place no longer applies.
    function handleInput() {
      onSelectRef.current(null)
    }

    autocomplete.addEventListener('gmp-select', handleSelect)
    autocomplete.addEventListener('input', handleInput)

    return () => {
      autocomplete.removeEventListener('gmp-select', handleSelect)
      autocomplete.removeEventListener('input', handleInput)
      autocomplete.remove()
    }
  }, [places])

  return (
    <div className="location-search">
      <span className="field-label">{label}</span>
      <div ref={containerRef} />
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

export default LocationSearch
