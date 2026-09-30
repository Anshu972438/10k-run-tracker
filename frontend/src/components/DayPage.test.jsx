import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DayPage from './DayPage'

const runs = [
  {
    id: 1,
    startLocation: 'Cubbon Park',
    endLocation: 'Lalbagh',
    distanceKm: 3,
    runDate: '2026-09-30',
    durationSeconds: 1080,
    paceSecondsPerKm: 360,
  },
  {
    id: 2,
    startLocation: 'Lalbagh',
    endLocation: 'MG Road',
    distanceKm: 2,
    runDate: '2026-09-30',
    durationSeconds: null,
    paceSecondsPerKm: null,
  },
  {
    id: 3,
    startLocation: 'India Gate',
    endLocation: 'Lodhi Garden',
    distanceKm: 2.43,
    runDate: '2026-09-20',
    durationSeconds: 900,
    paceSecondsPerKm: 370,
  },
]

describe('DayPage', () => {
  it('summarises only the runs of that day', () => {
    render(<DayPage date="2026-09-30" runs={runs} onShowRun={vi.fn()} />)

    expect(screen.getByText('5.00 km')).toBeInTheDocument()
    expect(screen.getByText('18:00')).toBeInTheDocument()
    expect(screen.getByText('6:00 /km')).toBeInTheDocument()
    expect(screen.getByText('No time recorded')).toBeInTheDocument()
    expect(screen.queryByText(/India Gate/)).not.toBeInTheDocument()
  })

  it('opens a run when it is clicked', async () => {
    const onShowRun = vi.fn()
    render(<DayPage date="2026-09-30" runs={runs} onShowRun={onShowRun} />)

    await userEvent.click(screen.getByText('Cubbon Park → Lalbagh'))

    expect(onShowRun).toHaveBeenCalledWith(1)
  })

  it('shows a message for a day without runs', () => {
    render(<DayPage date="2026-01-01" runs={runs} onShowRun={vi.fn()} />)

    expect(screen.getByText('No runs on this day.')).toBeInTheDocument()
  })
})
