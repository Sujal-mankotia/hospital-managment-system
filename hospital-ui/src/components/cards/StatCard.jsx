import { motion } from 'framer-motion'
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi'
import useCountUp from '../../hooks/useCountUp'
import { formatNumber } from '../../utils/format'

export default function StatCard({ label, value, prefix = '', delta, trend = 'up', icon: Icon, tone = 'primary' }) {
  const animated = useCountUp(value)
  const tones = {
    primary: 'bg-primary-light text-primary',
    teal: 'bg-teal-light text-teal',
    amber: 'bg-amber-light text-amber',
    rose: 'bg-rose-light text-rose',
  }

  return (
    <motion.div whileHover={{ y: -3 }} className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-light">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {prefix}{formatNumber(animated)}
          </p>
        </div>
        {Icon && (
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      {delta && (
        <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-teal' : 'text-rose'}`}>
          {trend === 'up' ? <FiArrowUpRight size={13} /> : <FiArrowDownRight size={13} />}
          {delta} <span className="text-slate-light font-normal">vs last week</span>
        </div>
      )}
    </motion.div>
  )
}
