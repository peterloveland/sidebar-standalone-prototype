import { ReactNode, forwardRef } from 'react';
import styles from './SidebarLabel.module.css';
import { PlusIcon } from 'lucide-react';

interface SidebarLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  trailingVisual?: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

export const SidebarLabel = forwardRef<HTMLDivElement, SidebarLabelProps>(
  ({ children, trailingVisual, onClick, isActive, className, style, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        {...props}
        className={`${styles.container} ${isActive ? styles.containerActive : ''} ${className || ''}`}
        style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
        onClick={(e) => {
          onClick?.();
          props.onClick?.(e);
        }}
      >
        <h3 className={styles.label}>{children}</h3>
        <PlusIcon size={16} className={styles.plusIcon} />
        {trailingVisual && <div className={styles.trailing}>{trailingVisual}</div>}
      </div>
    );
  }
);

SidebarLabel.displayName = 'SidebarLabel';
