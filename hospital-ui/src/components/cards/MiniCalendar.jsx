const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const eventDays = [6, 8, 14, 22]

export default function MiniCalendar() {
  // July 2026 starts on a Wednesday
  const firstDayOffset = 3
  const daysInMonth = 31
  const cells = [...Array(firstDayOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">July 2026</p>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {DAYS.map((d, i) => (
          <span key={i} className="text-[11px] font-medium text-slate-light">{d}</span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs ${
              day === 6
                ? 'bg-primary font-semibold text-white'
                : eventDays.includes(day)
                ? 'font-medium text-primary'
                : 'text-slate'
            }`}
          >
            {day || ''}
            {day && eventDays.includes(day) && day !== 6 && (
              <span className="absolute mt-6 h-1 w-1 rounded-full bg-primary" />
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
