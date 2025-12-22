import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
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
  const rowRef = useRef<HTMLDivElement>(null);
  const clickableRef = useRef<HTMLDivElement>(null);
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0, width: 0 });

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

  useEffect(() => {
    if (isEditing && clickableRef.current) {
      const updatePosition = () => {
        if (clickableRef.current) {
          const rect = clickableRef.current.getBoundingClientRect();
          setPortalPosition({
            top: rect.top + 8,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isEditing, value]);

  return (
    <>
      <div ref={rowRef} className={styles.container}>
        <SidebarLabel 
          trailingVisual={trailingVisual}
          onClick={() => !isEditing && handleEditingChange(true)}
          isActive={isEditing}
        >
          {label}
        </SidebarLabel>
        <div
          ref={clickableRef}
          onClick={() => !disableClickToEdit && !isEditing && handleEditingChange(true)}
          className={`${styles.clickable}`}
          style={{ cursor: 'default' }}
        >
          {renderDisplay(value)}
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>

      {isEditing &&
        createPortal(
          <>
            <div
              className={styles.backdrop}
              onClick={() => handleEditingChange(false)}
            />
            <div
              className={styles.portal}
              onClick={(e) => e.stopPropagation()}
              style={{
                top: `${portalPosition.top}px`,
                left: `${portalPosition.left}px`,
                width: `${portalPosition.width}px`,
              }}
            >
              {renderEditor(value, onChange)}
            </div>
          </>,
          document.body
        )}
    </>
  );
}
