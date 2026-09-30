function StatCard({ label, value, detail }) {
  return (
    <div className="stat-card">
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value">{value}</p>
      {detail && <p className="stat-card-detail">{detail}</p>}
    </div>
  )
}

export default StatCard
