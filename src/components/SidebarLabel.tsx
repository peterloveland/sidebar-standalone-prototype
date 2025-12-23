import { ReactNode, forwardRef } from 'react';
import styles from './SidebarLabel.module.css';
import { PlusIcon } from 'lucide-react';

interface SidebarLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  trailingVisual?: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  showPlusIcon?: boolean;
}

export const SidebarLabel = forwardRef<HTMLDivElement, SidebarLabelProps>(
  ({ children, trailingVisual, onClick, isActive, showPlusIcon = true, className, style, ...props }, ref) => {
    const isInteractive = onClick || showPlusIcon;
    
    return (
      <div 
        ref={ref}
        {...props}
        className={`${styles.container} ${isActive ? styles.containerActive : ''} ${!isInteractive ? styles.containerNonInteractive : ''} ${className || ''}`}
        style={{ cursor: isInteractive ? 'pointer' : 'default', ...style }}
        onClick={(e) => {
          onClick?.();
          props.onClick?.(e);
        }}
      >
        <h3 className={styles.label}>{children}</h3>
        {showPlusIcon && <PlusIcon size={16} className={styles.plusIcon} />}
        {trailingVisual && <div className={styles.trailing}>{trailingVisual}</div>}
      </div>
    );
  }
);

SidebarLabel.displayName = 'SidebarLabel';
