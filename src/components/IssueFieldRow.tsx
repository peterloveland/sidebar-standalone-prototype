import { useState, ReactNode, useRef, useEffect } from 'react';
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
  isColorAnimating?: boolean;
}

export function IssueFieldRow<T = any>({
  label,
  value,
  renderDisplay,
  renderEditor,
  onChange,
  className,
  description,
  isColorAnimating = false,
}: IssueFieldRowProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [containerHeight, setContainerHeight] = useState<string>('auto');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleOpenEdit = () => {
    if (!isEditing && buttonRef.current) {
      // Lock current height before opening
      const currentHeight = buttonRef.current.offsetHeight;
      setContainerHeight(`${currentHeight}px`);
      
      // Then start editing and animate
      setIsEditing(true);
      requestAnimationFrame(() => {
        setContainerHeight('calc-size(auto, size * 1)');
      });
    }
  };

  useEffect(() => {
    if (!isEditing) {
      // When closing, apply calc-size to animate the height change
      setContainerHeight('calc-size(auto, size * 1)');
    }
  }, [isEditing]);

  const anchorContent = (
    <button
      ref={buttonRef}
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
      onOpen={() => setIsEditing(true)}
      onClose={() => setIsEditing(false)}
      renderAnchor={(anchorProps) => (
        <div {...anchorProps} style={{ height: containerHeight, transition: 'height 0.3s ease-in-out', overflow: 'hidden' }}>
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
