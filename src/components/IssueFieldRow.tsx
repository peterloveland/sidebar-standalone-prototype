import { useState, ReactNode } from 'react';
import { AnchoredOverlay } from '@primer/react';
import styles from './IssueFieldRow.module.css';

interface IssueFieldRowProps<T = any> {
  label: string;
  value: T;
  renderDisplay: (value: T) => ReactNode;
  renderEditor: (value: T, onChange: (newValue: T) => void, onClose: () => void) => ReactNode;
  onChange: (value: T) => void;
}

export function IssueFieldRow<T = any>({
  label,
  value,
  renderDisplay,
  renderEditor,
  onChange,
}: IssueFieldRowProps<T>) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <AnchoredOverlay
      open={isEditing}
      onOpen={() => setIsEditing(true)}
      onClose={() => setIsEditing(false)}
      renderAnchor={(anchorProps) => (
        <div
          {...anchorProps}
          className={`${styles.container} ${isEditing ? styles.containerActive : ''}`}
          onClick={() => !isEditing && setIsEditing(true)}
        >
          <div className={styles.label}>{label}</div>
          <div className={styles.value}>{renderDisplay(value)}</div>
        </div>
      )}
      side="outside-bottom"
      align="start"
    >
      {renderEditor(value, onChange, () => setIsEditing(false))}
    </AnchoredOverlay>
  );
}
