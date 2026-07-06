const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14', xl: 'h-24 w-24' }

export default function Avatar({ src, name = '', size = 'md', ring = false, className = '' }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('')
  return (
    <div className={`relative shrink-0 rounded-full ${sizes[size]} ${ring ? 'ring-2 ring-primary/30 ring-offset-2' : ''} ${className}`}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">
          {initials}
        </div>
      )}
    </div>
  )
}
