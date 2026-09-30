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
    durationSeconds: 480,
    paceSecondsPerKm: 312,
  },
  {
    id: 2,
    startLocation: 'Big Ben',
    endLocation: 'Tower Bridge',
    distanceKm: 3.45,
    runDate: '2026-08-28',
    durationSeconds: 1200,
    paceSecondsPerKm: 348,
  },
]

describe('StatsPage', () => {
  it('shows the average and the personal records', () => {
    render(<StatsPage runs={runs} summary={{ totalRuns: 2, totalDistanceKm: 4.99 }} />)

    expect(screen.getByText('2.50 km')).toBeInTheDocument()
    // Longest run and longest time are both Big Ben; fastest pace is Dam Square.
    expect(screen.getAllByText('Big Ben → Tower Bridge')).toHaveLength(2)
    expect(screen.getByText('Dam Square → Rijksmuseum')).toBeInTheDocument()
    expect(screen.getByText('5:12 /km')).toBeInTheDocument()
  })

  it('shows a message when there are no runs', () => {
    render(<StatsPage runs={[]} summary={{ totalRuns: 0, totalDistanceKm: 0 }} />)

    expect(screen.getByText(/no runs yet/i)).toBeInTheDocument()
  })
})
