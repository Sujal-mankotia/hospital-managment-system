export default function Loader({ label = 'Loading records…', full = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-slate ${full ? 'h-64' : 'py-10'}`}>
      <svg width="120" height="36" viewBox="0 0 240 60" className="text-primary">
        <polyline
          points="0,30 40,30 55,10 70,50 85,30 110,30 122,18 134,42 146,30 240,30"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="240"
          className="animate-pulseline"
        />
      </svg>
      <p className="text-xs font-medium">{label}</p>
    </div>
  )
}
