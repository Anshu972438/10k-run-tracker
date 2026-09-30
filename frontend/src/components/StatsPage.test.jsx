import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatsPage from './StatsPage'

const runs = [
  {
    id: 1,
    startLocation: 'Dam Square',
    endLocation: 'Rijksmuseum',
    distanceKm: 1.54,
    runDate: '2026-09-30',
  },
  {
    id: 2,
    startLocation: 'Big Ben',
    endLocation: 'Tower Bridge',
    distanceKm: 3.45,
    runDate: '2026-08-28',
  },
]

describe('StatsPage', () => {
  it('shows the longest and shortest run', () => {
    render(<StatsPage runs={runs} summary={{ totalRuns: 2, totalDistanceKm: 4.99 }} />)

    expect(screen.getByText('Big Ben → Tower Bridge')).toBeInTheDocument()
    expect(screen.getByText('Dam Square → Rijksmuseum')).toBeInTheDocument()
    expect(screen.getByText('2.50 km')).toBeInTheDocument()
  })

  it('shows a message when there are no runs', () => {
    render(<StatsPage runs={[]} summary={{ totalRuns: 0, totalDistanceKm: 0 }} />)

    expect(screen.getByText(/no runs yet/i)).toBeInTheDocument()
  })
})
