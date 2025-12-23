import { useState, ReactNode } from 'react';
import { AnchoredOverlay, Tooltip } from '@primer/react';
import styles from './IssueFieldRow.module.css';
import { useHeightAnimation } from '../hooks/useHeightAnimation';

interface IssueFieldRowProps<T = any> {
  label: string;
  value: T;
  renderDisplay: (value: T) => ReactNode;
  renderEditor: (value: T, onChange: (newValue: T) => void, onClose: () => void) => ReactNode;
  onChange: (value: T) => void;
  onEditingChange?: (isEditing: boolean) => void;
  className?: string;
  description?: string;
  isColorAnimating?: boolean;
}

export function IssueFieldRow<T = any>({
  label,
  value,
  renderDisplay,
  renderEditor,
  onChange,
  onEditingChange,
  className,
  description,
  isColorAnimating = false,
}: IssueFieldRowProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const { lockHeight, animateToAuto, getContainerProps } = useHeightAnimation();

  const handleOpenEdit = () => {
    if (!isEditing) {
      lockHeight();
      setIsEditing(true);
      onEditingChange?.(true);
      setTimeout(() => animateToAuto(), 100);
    }
  };

  const handleClose = () => {
    lockHeight();
    setIsEditing(false);
    onEditingChange?.(false);
    setTimeout(() => animateToAuto(), 100);
  };

  const containerProps = getContainerProps();

  const anchorContent = (
    <button
      className={`${styles.container} ${isEditing ? styles.containerActive : ''} ${className || ''} ${isColorAnimating ? styles.containerColored : ''}`}
      onClick={handleOpenEdit}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{renderDisplay(value)}</div>
    </button>
  );

  return (
    <AnchoredOverlay
      open={isEditing}
      onOpen={() => {
        setIsEditing(true);
        onEditingChange?.(true);
      }}
      onClose={handleClose}
      renderAnchor={(anchorProps) => (
        <div 
          {...anchorProps} 
          {...containerProps}
          className={containerProps.className}
          style={{ ...containerProps.style, overflow: 'hidden' }}
        >
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
      {renderEditor(value, onChange, handleClose)}
    </AnchoredOverlay>
  );
}
