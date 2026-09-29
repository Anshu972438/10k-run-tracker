function DistanceSummary({ totalDistanceKm, totalRuns }) {
  return (
    <section className="distance-summary">
      <p className="distance-summary-label">Total distance</p>
      <p className="distance-summary-value">{totalDistanceKm.toFixed(2)} km</p>
      <p className="distance-summary-runs">
        {totalRuns} {totalRuns === 1 ? 'run' : 'runs'}
      </p>
    </section>
  )
}

export default DistanceSummary
