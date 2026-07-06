import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <svg width="200" height="60" viewBox="0 0 240 60" className="mb-6 text-primary">
        <polyline
          points="0,30 40,30 55,10 70,50 85,30 110,30 122,18 134,42 146,30 240,30"
          fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="240" className="animate-pulseline"
        />
      </svg>
      <h1 className="font-display text-6xl font-bold text-ink">404</h1>
      <p className="mt-2 text-lg font-semibold text-ink">This chart doesn't exist</p>
      <p className="mt-1 max-w-sm text-sm text-slate">The page you're looking for was moved, renamed, or never admitted in the first place.</p>
      <Link to="/dashboard" className="mt-6">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  )
}
