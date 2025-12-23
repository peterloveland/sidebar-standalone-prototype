import styles from './ColorDot.module.css';

type ColorName = 'blue' | 'green' | 'red' | 'orange' | 'yellow' | 'purple' | 'gray';

interface ColorDotProps {
  color: ColorName;
}

export function ColorDot({ color }: ColorDotProps) {
  return <span className={`${styles.dot} ${styles[color]}`} />;
}
