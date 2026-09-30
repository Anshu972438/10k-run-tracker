import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DistanceSummary from './DistanceSummary'

describe('DistanceSummary', () => {
  it('shows the total distance, number of runs and average', () => {
    render(<DistanceSummary totalDistanceKm={8.17} totalRuns={3} />)

    expect(screen.getByText('8.17')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2.72 km')).toBeInTheDocument()
  })

  it('shows zero when there are no runs', () => {
    render(<DistanceSummary totalDistanceKm={0} totalRuns={0} />)

    expect(screen.getByText('0.00')).toBeInTheDocument()
    expect(screen.getByText('0.00 km')).toBeInTheDocument()
  })

  it('links the runs to the history and the average to the statistics page', () => {
    render(<DistanceSummary totalDistanceKm={8.17} totalRuns={3} />)

    expect(screen.getByRole('link', { name: /runs/i })).toHaveAttribute('href', '#history')
    expect(screen.getByRole('link', { name: /average per run/i })).toHaveAttribute('href', '#stats')
  })
})
