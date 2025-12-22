import * as React from "react"
import { cn } from "../../lib/utils"
import styles from './button.module.css'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          styles.button,
          {
            [styles.default]: variant === 'default',
            [styles.secondary]: variant === 'secondary',
            [styles.ghost]: variant === 'ghost',
            [styles.outline]: variant === 'outline',
          },
          {
            [styles.sizeDefault]: size === 'default',
            [styles.sizeSm]: size === 'sm',
            [styles.sizeLg]: size === 'lg',
            [styles.sizeIcon]: size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
