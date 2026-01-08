import { useState, useRef, ReactNode, useEffect } from 'react';
import { AnchoredOverlay } from '@primer/react';
import styles from './SidebarRow.module.css';
import { SidebarLabel } from './SidebarLabel';
import { useHeightAnimation } from '../hooks/useHeightAnimation';

type FieldValue = string | number | string[] | Date | null | undefined;

interface SidebarRowProps<T extends FieldValue = FieldValue> {
  label: string;
  value: T;
  type: 'text' | 'number' | 'single-select' | 'multi-select' | 'date';
  renderDisplay: (value: T, onChange: (newValue: T) => void, openEditor: () => void) => ReactNode;
  renderEditor: (value: T, onChange: (newValue: T) => void, closeEditor: () => void) => ReactNode;
  onChange: (value: T) => void;
  onEditingChange?: (isEditing: boolean) => void;
  trailingVisual?: ReactNode;
  footer?: ReactNode;
  disableClickToEdit?: boolean;
  noPadding?: boolean;
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
  noPadding = false,
}: SidebarRowProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [valueChangedWhileEditing, setValueChangedWhileEditing] = useState(false);
  const prevValueRef = useRef<T>(value);
  const { lockHeight, animateToAuto, getContainerProps } = useHeightAnimation(300);

  const handleEditingChange = (editing: boolean) => {
    if (editing && !isEditing) {
      // Lock height when entering edit mode
      lockHeight();
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
    if (!isEditing && valueChangedWhileEditing) {
      // Dialog closed and value changed, now animate height
      animateToAuto();
      setValueChangedWhileEditing(false);
    }
  }, [isEditing, valueChangedWhileEditing, animateToAuto]);

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
          {renderEditor(value, onChange, () => handleEditingChange(false))}
      </AnchoredOverlay>
      <div
        {...getContainerProps()}
        onClick={() =>
          !disableClickToEdit && !isEditing && handleEditingChange(true)
        }
        className={`${!disableClickToEdit && hasValue ? styles.clickable : ''} ${getContainerProps().className}`}
        style={{ 
          ...getContainerProps().style,
          cursor: "default", 
          padding: noPadding ? '0' : (renderDisplay(value, onChange, () => handleEditingChange(true)) ? undefined : '0'),
        }}
      >
        {renderDisplay(value, onChange, () => handleEditingChange(true))}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
       