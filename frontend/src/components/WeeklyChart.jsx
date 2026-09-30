import { formatDate } from '../utils/format'
import { weeklyDistance } from '../utils/stats'

function WeeklyChart({ runs }) {
  const weeks = weeklyDistance(runs)
  const maxKm = Math.max(...weeks.map((week) => week.km), 1)

  return (
    <section className="month-list">
      <h3>Last 8 weeks</h3>
      <ol className="weekly-chart">
        {weeks.map((week) => (
          <li key={week.weekStart}>
            <span className="weekly-km">{week.km > 0 ? week.km.toFixed(1) : ''}</span>
            <span className="weekly-bar-track">
              <span className="weekly-bar" style={{ height: `${(week.km / maxKm) * 100}%` }} />
            </span>
            <span className="weekly-label">
              {formatDate(week.weekStart, { day: 'numeric', month: 'short' })}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default WeeklyChart
