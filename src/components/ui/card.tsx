import { cn } from '../../lib/utils'
import { forwardRef } from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl',
        variant === 'default' && 'bg-surface border border-border',
        variant === 'elevated' && 'bg-surface-elevated shadow-xl',
        variant === 'glass' && 'glass',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export { Card }