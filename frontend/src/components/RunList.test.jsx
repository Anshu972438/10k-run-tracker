import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RunList from './RunList'

const run = {
  id: 1,
  startLocation: 'Big Ben',
  startLatitude: 51.5007,
  startLongitude: -0.1246,
  endLocation: 'Tower Bridge',
  endLatitude: 51.5055,
  endLongitude: -0.0754,
  distanceKm: 3.45,
  runDate: '2026-09-28',
}

describe('RunList', () => {
  it('shows a message when there are no runs', () => {
    render(<RunList runs={[]} onSelectRun={vi.fn()} onDeleteRun={vi.fn()} />)

    expect(screen.getByText(/no runs yet/i)).toBeInTheDocument()
  })

  it('shows each run with its route and distance', () => {
    render(<RunList runs={[run]} onSelectRun={vi.fn()} onDeleteRun={vi.fn()} />)

    expect(screen.getByText('Big Ben → Tower Bridge')).toBeInTheDocument()
    expect(screen.getByText('3.45 km')).toBeInTheDocument()
  })

  it('selects a run when it is clicked', async () => {
    const onSelectRun = vi.fn()
    render(<RunList runs={[run]} onSelectRun={onSelectRun} onDeleteRun={vi.fn()} />)

    await userEvent.click(screen.getByText('Big Ben → Tower Bridge'))

    expect(onSelectRun).toHaveBeenCalledWith(1)
  })

  it('deletes a run only after the user confirms', async () => {
    const onDeleteRun = vi.fn()
    const confirm = vi.spyOn(window, 'confirm')
    render(<RunList runs={[run]} onSelectRun={vi.fn()} onDeleteRun={onDeleteRun} />)
    const deleteButton = screen.getByRole('button', { name: /delete run/i })

    confirm.mockReturnValueOnce(false)
    await userEvent.click(deleteButton)
    expect(onDeleteRun).not.toHaveBeenCalled()

    confirm.mockReturnValueOnce(true)
    await userEvent.click(deleteButton)
    expect(onDeleteRun).toHaveBeenCalledWith(1)
  })
})
