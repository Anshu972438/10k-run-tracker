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
      <div className="summary-stats">
        <a className="summary-stat" href="#history">
          <span className="summary-stat-label">Runs</span>
          <span className="summary-stat-value">{totalRuns}</span>
        </a>
        <a className="summary-stat" href="#stats">
          <span className="summary-stat-label">Average per run</span>
          <span className="summary-stat-value">{averageKm.toFixed(2)} km</span>
        </a>
      </div>
    </section>
  )
}

export default DistanceSummary
