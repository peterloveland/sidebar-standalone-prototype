import { useState, useRef, ReactNode } from 'react';
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

  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
    onEditingChange?.(editing);
  };

  const hasValue = (() => {
    if (value === null || value === undefined) return false;
    if (type === 'text' && value === '') return false;
    if (type === 'multi-select' && Array.isArray(value) && value.length === 0) return false;
    return true;
  })();

  return (
    <div className={styles.container}>
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
        onClick={() =>
          !disableClickToEdit && !isEditing && handleEditingChange(true)
        }
        className={`${styles.clickable}`}
        style={{ cursor: "default" }}
      >
        {renderDisplay(value)}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
