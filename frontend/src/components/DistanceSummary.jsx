function DistanceSummary({ totalDistanceKm, totalRuns }) {
  const averageKm = totalRuns > 0 ? totalDistanceKm / totalRuns : 0

  return (
    <section className="distance-summary" aria-label="Distance summary">
      <div>
        <p className="summary-label">Total distance</p>
        <p className="summary-total">
          {totalDistanceKm.toFixed(2)}
          <span className="summary-unit">km</span>
        </p>
      </div>
      <dl className="summary-stats">
        <div>
          <dt>Runs</dt>
          <dd>{totalRuns}</dd>
        </div>
        <div>
          <dt>Average per run</dt>
          <dd>{averageKm.toFixed(2)} km</dd>
        </div>
      </dl>
    </section>
  )
}

export default DistanceSummary
