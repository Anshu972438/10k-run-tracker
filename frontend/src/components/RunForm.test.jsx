import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RunForm from './RunForm'
import { createRun } from '../services/runApi'

// The real LocationSearch needs Google Maps, so the tests use a simple button
// that "selects" a fixed place instead.
vi.mock('./LocationSearch', () => ({
  default: ({ label, onSelect }) => (
    <button
      type="button"
      onClick={() => onSelect({ name: `${label} place`, latitude: 51.5, longitude: -0.12 })}
    >
      Pick {label}
    </button>
  ),
}))

vi.mock('../services/runApi', () => ({
  createRun: vi.fn(),
}))

describe('RunForm', () => {
  it('keeps the submit button disabled until both places are selected', async () => {
    render(<RunForm onRunCreated={vi.fn()} />)
    const submitButton = screen.getByRole('button', { name: 'Add run' })

    expect(submitButton).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Pick Start location' }))
    expect(submitButton).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Pick End location' }))
    expect(submitButton).toBeEnabled()
  })

  it('saves the run and reports it to the parent', async () => {
    const createdRun = { id: 7 }
    createRun.mockResolvedValue(createdRun)
    const onRunCreated = vi.fn()
    render(<RunForm onRunCreated={onRunCreated} />)

    await userEvent.click(screen.getByRole('button', { name: 'Pick Start location' }))
    await userEvent.click(screen.getByRole('button', { name: 'Pick End location' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add run' }))

    expect(createRun).toHaveBeenCalledWith(
      expect.objectContaining({
        startLocation: 'Start location place',
        endLocation: 'End location place',
        runDate: null,
      }),
    )
    expect(onRunCreated).toHaveBeenCalledWith(createdRun)
  })

  it('shows the error message when saving fails', async () => {
    createRun.mockRejectedValue(new Error('startLatitude must not be null'))
    render(<RunForm onRunCreated={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Pick Start location' }))
    await userEvent.click(screen.getByRole('button', { name: 'Pick End location' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add run' }))

    expect(await screen.findByText('startLatitude must not be null')).toBeInTheDocument()
  })
})
