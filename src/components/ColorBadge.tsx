import styles from './ColorBadge.module.css';

type ColorName = 'blue' | 'green' | 'red' | 'orange' | 'yellow' | 'purple' | 'gray';

interface ColorBadgeProps {
  color: ColorName;
  children: React.ReactNode;
}

export function ColorBadge({ color, children }: ColorBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[color]}`}>
      {children}
    </span>
  );
}
