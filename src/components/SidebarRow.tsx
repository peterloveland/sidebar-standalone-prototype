import { useState, useRef, ReactNode, useEffect } from 'react';
import { AnchoredOverlay } from '@primer/react';
import styles from './SidebarRow.module.css';
import { SidebarLabel } from './SidebarLabel';

type FieldValue = string | number | string[] | Date | null | undefined;

interface SidebarRowProps<T extends FieldValue = FieldValue> {
  label: string;
  value: T;
  type: 'text' | 'number' | 'single-select' | 'multi-select' | 'date';
  renderDisplay: (value: T) => ReactNode;
  renderEditor: (value: T, onChange: (newValue: T) => void) => ReactNode;
  onChange: (value: T) => void;
  onEditingChange?: (isEditing: boolean) => void;
  trailingVisual?: ReactNode;
  footer?: ReactNode;
  disableClickToEdit?: boolean;
}

export function SidebarRow<T extends FieldValue = FieldValue>({
  label,
  value,
  type,
  renderDisplay,
  renderEditor,
  onChange,
  onEditingChange,
  trailingVisual,
  footer,
  disableClickToEdit = false,
}: SidebarRowProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);
  const [useCalcSize, setUseCalcSize] = useState(false);
  const [valueChangedWhileEditing, setValueChangedWhileEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef<T>(value);

  const handleEditingChange = (editing: boolean) => {
    if (editing && !isEditing && contentRef.current) {
      // Lock height when entering edit mode
      const height = contentRef.current.offsetHeight;
      setLockedHeight(height);
      setUseCalcSize(false);
      setValueChangedWhileEditing(false);
    }
    setIsEditing(editing);
    onEditingChange?.(editing);
  };

  // Detect value changes while editing
  useEffect(() => {
    if (isEditing && value !== prevValueRef.current) {
      // Value changed while editing, flag it but don't animate yet
      setValueChangedWhileEditing(true);
    }
    prevValueRef.current = value;
  }, [value, isEditing]);

  // Animate when editing ends if value changed
  useEffect(() => {
    if (!isEditing && valueChangedWhileEditing && lockedHeight !== null) {
      // Dialog closed and value changed, now animate height only
      // Keep content visible so React can diff and only animate new items
      // Force reflow to ensure the locked height is painted
      if (contentRef.current) {
        contentRef.current.offsetHeight;
      }
      requestAnimationFrame(() => {
        setUseCalcSize(true);
      });
    } else if (!isEditing) {
      // Reset if no value change
      setLockedHeight(null);
      setUseCalcSize(false);
      setValueChangedWhileEditing(false);
    }
  }, [isEditing, valueChangedWhileEditing, lockedHeight]);

  const hasValue = (() => {
    if (value === null || value === undefined) return false;
    if (type === 'text' && value === '') return false;
    if (type === 'multi-select' && Array.isArray(value) && value.length === 0) return false;
    return true;
  })();

  return (
    <div className={`${styles.container} ${isEditing ? styles.editing : ''}`}>
      <AnchoredOverlay
        open={isEditing}
        onOpen={() => handleEditingChange(true)}
        onClose={() => handleEditingChange(false)}
        renderAnchor={(anchorProps) => (
          <SidebarLabel
            {...anchorProps}
            trailingVisual={trailingVisual}
            onClick={() => !isEditing && handleEditingChange(true)}
            isActive={isEditing}
          >
            {label}
          </SidebarLabel>
        )}
        side="outside-bottom"
        align="start"
      >
          {renderEditor(value, onChange)}
      </AnchoredOverlay>
      <div
        ref={contentRef}
        onClick={() =>
          !disableClickToEdit && !isEditing && handleEditingChange(true)
        }
        className={`${styles.clickable} ${useCalcSize ? styles.animateHeight : ''}`}
        style={{ 
          cursor: "default", 
          padding: renderDisplay(value) ? undefined : '0',
          height: lockedHeight !== null && !useCalcSize
            ? `${lockedHeight}px`
            : undefined,
          transition: lockedHeight !== null && !useCalcSize ? 'height 1s' : undefined,
        }}
      >
        {renderDisplay(value)}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
       