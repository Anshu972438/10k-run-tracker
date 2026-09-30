import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import RunPage from './RunPage'

const run = {
  id: 1,
  startLocation: 'Cubbon Park',
  startLatitude: 12.9763,
  startLongitude: 77.5929,
  endLocation: 'Lalbagh',
  endLatitude: 12.9507,
  endLongitude: 77.5848,
  distanceKm: 3,
  runDate: '2026-09-30',
  durationSeconds: 1080,
  paceSecondsPerKm: 360,
}

const slowerRun = { ...run, id: 2, distanceKm: 1, durationSeconds: 420, paceSecondsPerKm: 420 }
const summary = { totalRuns: 2, totalDistanceKm: 4 }

describe('RunPage', () => {
  it('shows the time, pace and speed of the run', () => {
    render(<RunPage run={run} runs={[run, slowerRun]} summary={summary} isLoading={false} />)

    expect(screen.getByText('18:00')).toBeInTheDocument()
    expect(screen.getByText('6:00 /km')).toBeInTheDocument()
    expect(screen.getByText('10.0 km/h')).toBeInTheDocument()
  })

  it('compares the run with the other runs', () => {
    render(<RunPage run={run} runs={[run, slowerRun]} summary={summary} isLoading={false} />)

    // Average pace = 1500 s / 4 km = 375 s/km, so this run is 15 s/km faster.
    expect(screen.getByText('15 s/km faster than your average (6:15 /km)')).toBeInTheDocument()
    expect(screen.getByText('1.00 km longer than your average run (2.00 km)')).toBeInTheDocument()
  })

  it('links the date to the daily summary', () => {
    render(<RunPage run={run} runs={[run]} summary={summary} isLoading={false} />)

    expect(screen.getByRole('link', { name: /september/i })).toHaveAttribute(
      'href',
      '#day/2026-09-30',
    )
  })

  it('explains when a run has no time', () => {
    const untimedRun = { ...run, durationSeconds: null, paceSecondsPerKm: null }
    render(<RunPage run={untimedRun} runs={[untimedRun]} summary={summary} isLoading={false} />)

    expect(screen.getByText(/no time was recorded/i)).toBeInTheDocument()
  })

  it('shows a message when the run does not exist', () => {
    render(<RunPage run={undefined} runs={[]} summary={summary} isLoading={false} />)

    expect(screen.getByText(/this run does not exist/i)).toBeInTheDocument()
  })
})
