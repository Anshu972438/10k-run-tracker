import { useEffect } from 'react'
import { AdvancedMarker, Map, Pin, Polyline, useMap } from '@vis.gl/react-google-maps'

const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

// Google Maps has no "dashed" option, so the line itself is hidden and a short
// dash symbol is repeated along it instead.
const DASHED_LINE = [
  {
    icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: '#1565c0', scale: 3 },
    offset: '0',
    repeat: '16px',
  },
]

function FitBounds({ run }) {
  const map = useMap()

  useEffect(() => {
    if (!map) {
      return
    }
    const bounds = new google.maps.LatLngBounds()
    bounds.extend({ lat: run.startLatitude, lng: run.startLongitude })
    bounds.extend({ lat: run.endLatitude, lng: run.endLongitude })
    map.fitBounds(bounds, 60)
  }, [map, run])

  return null
}

function RunMap({ run }) {
  if (!run) {
    return <p className="map-message">Add a run to see it on the map.</p>
  }

  const start = { lat: run.startLatitude, lng: run.startLongitude }
  const end = { lat: run.endLatitude, lng: run.endLongitude }

  return (
    <section className="run-map">
      <Map mapId={MAP_ID} defaultCenter={start} defaultZoom={13} gestureHandling="greedy">
        <Polyline path={[start, end]} geodesic strokeOpacity={0} icons={DASHED_LINE} />
        <AdvancedMarker position={start} title={`Start: ${run.startLocation}`}>
          <Pin background="#2e7d32" borderColor="#1b5e20" glyphColor="#fff" glyphText="S" />
        </AdvancedMarker>
        <AdvancedMarker position={end} title={`End: ${run.endLocation}`}>
          <Pin background="#c62828" borderColor="#8e0000" glyphColor="#fff" glyphText="E" />
        </AdvancedMarker>
        <FitBounds run={run} />
      </Map>
    </section>
  )
}

export default RunMap
