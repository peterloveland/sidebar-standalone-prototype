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

  const handleEditingChange = (editing: boolean) => {
    if (editing && !isEditing) {
      // Lock height when entering edit mode
      lockHeight();
    } else if (!editing && isEditing) {
      // Lock height when exiting edit mode
      lockHeight();
      setTimeout(() => animateToAuto(), 100);
    }
    setIsEditing(editing);
    onEditingChange?.(editing);
  };

  const handleClose = () => {
    handleEditingChange(false);
  };

  const containerProps = getContainerProps();

  const anchorContent = (
    <button
      className={`${styles.container} ${isEditing ? styles.containerActive : ''} ${className || ''} ${isColorAnimating ? styles.containerColored : ''}`}
      onClick={() => {
        if (!isEditing) {
          handleEditingChange(true);
        }
      }}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{renderDisplay(value)}</div>
    </button>
  );

  return (
    <AnchoredOverlay
      open={isEditing}
      onOpen={() => {
        handleEditingChange(true);
      }}
      onClose={() => {
        handleClose();
      }}
      renderAnchor={(anchorProps) => (
          <div 
            {...containerProps}
            {...anchorProps}
            className={`${containerProps.className} ${anchorProps.className || ''}`}
            style={{ ...containerProps.style, ...anchorProps.style, overflow: 'hidden' }}
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
