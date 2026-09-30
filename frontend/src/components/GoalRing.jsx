import { goalProgress } from '../utils/stats'

const RADIUS = 34
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Progress towards the next 10 km, shown as a ring.
function GoalRing({ totalDistanceKm }) {
  const { completed, progressKm } = goalProgress(totalDistanceKm)
  const remainingKm = 10 - progressKm

  return (
    <div className="goal-ring">
      <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
        <circle className="goal-ring-track" cx="40" cy="40" r={RADIUS} />
        <circle
          className="goal-ring-fill"
          cx="40"
          cy="40"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progressKm / 10)}
        />
      </svg>
      <div>
        <p className="goal-ring-title">{remainingKm.toFixed(2)} km to your next 10K</p>
        <p className="goal-ring-detail">
          {completed} × 10K completed · {progressKm.toFixed(2)} / 10 km
        </p>
      </div>
    </div>
  )
}

export default GoalRing
