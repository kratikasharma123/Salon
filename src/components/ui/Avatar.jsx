import { getInitials } from '../../utils/authHelpers'

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

function Avatar({ src, alt, name, size = 'md', className = '' }) {
  const classes = sizeClasses[size] || sizeClasses.md

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'User avatar'}
        className={`${classes} rounded-full border border-beige object-cover shadow-subtle ${className}`}
      />
    )
  }

  return (
    <span
      aria-label={name ? `${name} avatar` : 'User avatar'}
      className={`${classes} inline-flex shrink-0 items-center justify-center rounded-full bg-terracotta/10 font-semibold text-terracotta shadow-subtle ${className}`}
    >
      {getInitials(name)}
    </span>
  )
}

export default Avatar
