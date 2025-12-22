import { ReactNode } from 'react';
import styles from './SidebarLabel.module.css';
import { PlusIcon } from 'lucide-react';

interface SidebarLabelProps {
  children: ReactNode;
  trailingVisual?: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

export function SidebarLabel({ children, trailingVisual, onClick, isActive }: SidebarLabelProps) {
  return (
    <div 
      className={`${styles.container} ${isActive ? styles.containerActive : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <h3 className={styles.label}>{children}</h3>
      <PlusIcon size={16} className={styles.plusIcon} />
      {trailingVisual && <div className={styles.trailing}>{trailingVisual}</div>}
    </div>
  );
}
