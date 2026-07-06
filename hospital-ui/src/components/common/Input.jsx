import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = '', wrapperClassName = '', ...props },
  ref
) {
  return (
    <label className={`block ${wrapperClassName}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" size={16} />}
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-surface py-2.5 text-sm text-ink placeholder:text-slate-light transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } ${error ? 'border-rose' : 'border-line'} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="mt-1 block text-xs text-rose">{error}</span>}
    </label>
  )
})

export default Input
