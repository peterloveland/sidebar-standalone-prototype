import * as React from "react"
import { cn } from "../../lib/utils"
import styles from './badge.module.css'

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'outline' }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        styles.badge,
        {
          [styles.default]: variant === 'default',
          [styles.secondary]: variant === 'secondary',
          [styles.outline]: variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
