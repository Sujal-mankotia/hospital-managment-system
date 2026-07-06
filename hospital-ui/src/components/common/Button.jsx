const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
  secondary: 'bg-primary-light text-primary hover:bg-primary/15',
  ghost: 'bg-transparent text-slate hover:bg-slate-100',
  danger: 'bg-rose text-white hover:bg-rose/90',
  outline: 'border border-line bg-surface text-ink hover:border-primary/40 hover:text-primary',
}

const sizes = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && !iconRight && <Icon className="shrink-0" />}
      {children}
      {Icon && iconRight && <Icon className="shrink-0" />}
    </button>
  )
}
