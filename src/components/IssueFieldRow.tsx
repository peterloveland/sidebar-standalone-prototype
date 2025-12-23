import { useState, ReactNode } from 'react';
import { AnchoredOverlay, Tooltip } from '@primer/react';
import styles from './IssueFieldRow.module.css';

interface IssueFieldRowProps<T = any> {
  label: string;
  value: T;
  renderDisplay: (value: T) => ReactNode;
  renderEditor: (value: T, onChange: (newValue: T) => void, onClose: () => void) => ReactNode;
  onChange: (value: T) => void;
  className?: string;
  description?: string;
}

export function IssueFieldRow<T = any>({
  label,
  value,
  renderDisplay,
  renderEditor,
  onChange,
  className,
  description,
}: IssueFieldRowProps<T>) {
  const [isEditing, setIsEditing] = useState(false);

  const anchorContent = (
    <button
      className={`${styles.container} ${isEditing ? styles.containerActive : ''} ${className || ''}`}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{renderDisplay(value)}</div>
    </button>
  );

  return (
    <AnchoredOverlay
      open={isEditing}
      onOpen={() => setIsEditing(true)}
      onClose={() => setIsEditing(false)}
      renderAnchor={(anchorProps) => (
        <div {...anchorProps}>
          {description && !isEditing ? (
            <Tooltip text={description} delay="long">
              {anchorContent}
            </Tooltip>
          ) : (
            anchorContent
          )}
        </div>
      )}
      side="outside-bottom"
      align="start"
    >
      {renderEditor(value, onChange, () => setIsEditing(false))}
    </AnchoredOverlay>
  );
}
