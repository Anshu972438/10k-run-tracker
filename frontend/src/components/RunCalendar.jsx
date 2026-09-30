import { useState } from 'react'
import { todayIsoDate } from '../utils/format'
import { monthCalendar } from '../utils/stats'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Darker green for more kilometers, relative to the biggest day of the month.
function intensity(km, maxKm) {
  if (km === 0) {
    return 0
  }
  return Math.ceil((km / maxKm) * 4)
}

function RunCalendar({ runs }) {
  const today = todayIsoDate()
  const [year, setYear] = useState(Number(today.slice(0, 4)))
  const [month, setMonth] = useState(Number(today.slice(5, 7)) - 1)
  const cells = monthCalendar(year, month, runs)
  const maxKm = Math.max(...cells.map((cell) => cell?.km ?? 0))
  const isCurrentMonth = `${year}-${String(month + 1).padStart(2, '0')}` === today.slice(0, 7)
  const monthName = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  function changeMonth(step) {
    const next = new Date(year, month + step, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
  }

  return (
    <section className="month-list">
      <div className="calendar-header">
        <h3>{monthName}</h3>
        <div className="calendar-nav">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
            ‹
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            disabled={isCurrentMonth}
          >
            ›
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="calendar-weekday">
            {weekday}
          </span>
        ))}
        {cells.map((cell, index) =>
          cell === null ? (
            <span key={`empty-${index}`} />
          ) : cell.km > 0 ? (
            <a
              key={cell.date}
              href={`#day/${cell.date}`}
              className={`calendar-day level-${intensity(cell.km, maxKm)}`}
              title={`${cell.km.toFixed(2)} km`}
              aria-label={`${cell.day}: ${cell.km.toFixed(2)} km`}
            >
              {cell.day}
            </a>
          ) : (
            <span
              key={cell.date}
              className={`calendar-day${cell.date === today ? ' calendar-today' : ''}`}
            >
              {cell.day}
            </span>
          ),
        )}
      </div>
    </section>
  )
}

export default RunCalendar
