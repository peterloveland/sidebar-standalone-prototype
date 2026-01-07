import { forwardRef, ButtonHTMLAttributes } from 'react';
import styles from './IconButton.module.css';

type IconButtonSize = 'small' | 'medium' | 'large';
type IconButtonVariant = 'default' | 'primary' | 'danger' | 'invisible';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  'aria-label': string;
  tooltip?: string;
}

const sizeMap: Record<IconButtonSize, { button: number; icon: number }> = {
  small: { button: 28, icon: 16 },
  medium: { button: 32, icon: 16 },
  large: { button: 40, icon: 20 },
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = 'medium', variant = 'default', className, tooltip, ...props }, ref) => {
    const dimensions = sizeMap[size];

    return (
      <button
        ref={ref}
        className={`${styles.iconButton} ${styles[variant]} ${className || ''}`}
        style={{
          width: dimensions.button,
          height: dimensions.button,
        }}
        type="button"
        title={tooltip}
        {...props}
      >
        <Icon size={dimensions.icon} />
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
