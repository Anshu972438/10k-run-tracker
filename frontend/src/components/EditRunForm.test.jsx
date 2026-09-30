import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import EditRunForm from './EditRunForm'

const run = { id: 1, runDate: '2026-09-28', durationSeconds: 1930 }

describe('EditRunForm', () => {
  it('starts with the current date and time of the run', () => {
    render(<EditRunForm run={run} onSave={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByLabelText('Date')).toHaveValue('28/09/2026')
    expect(screen.getByLabelText('Minutes')).toHaveValue(32)
    expect(screen.getByLabelText('Seconds')).toHaveValue(10)
  })

  it('saves the changed date and time', async () => {
    const onSave = vi.fn().mockResolvedValue()
    render(<EditRunForm run={run} onSave={onSave} onCancel={vi.fn()} />)

    await userEvent.clear(screen.getByLabelText('Date'))
    await userEvent.type(screen.getByLabelText('Date'), '27/09/2026')
    await userEvent.clear(screen.getByLabelText('Minutes'))
    await userEvent.type(screen.getByLabelText('Minutes'), '30')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave).toHaveBeenCalledWith({ runDate: '2026-09-27', durationSeconds: 1810 })
  })

  it('removes the time when all time fields are cleared', async () => {
    const onSave = vi.fn().mockResolvedValue()
    render(<EditRunForm run={run} onSave={onSave} onCancel={vi.fn()} />)

    await userEvent.clear(screen.getByLabelText('Minutes'))
    await userEvent.clear(screen.getByLabelText('Seconds'))
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave).toHaveBeenCalledWith({ runDate: '2026-09-28', durationSeconds: null })
  })

  it('needs a date, because a saved run always has one', async () => {
    render(<EditRunForm run={run} onSave={vi.fn()} onCancel={vi.fn()} />)

    await userEvent.clear(screen.getByLabelText('Date'))

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })

  it('shows the error when saving fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Run with id 1 not found'))
    render(<EditRunForm run={run} onSave={onSave} onCancel={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Run with id 1 not found')).toBeInTheDocument()
  })
})
