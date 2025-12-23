import { useState, useEffect, useRef } from 'react';
import styles from './IssueFieldRow.module.css';
import fieldStyles from './IssueField.module.css';

interface IssueField_textProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  forceEdit?: boolean;
}

const OFFSET_HEIGHT = 2

export function IssueField_text({ label, value, onChange, forceEdit = false }: IssueField_textProps) {
  const [isEditing, setIsEditing] = useState(forceEdit);
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (forceEdit !== undefined) {
      setIsEditing(forceEdit);
    }
  }, [forceEdit]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + OFFSET_HEIGHT + "px";
    }
  }, [isEditing]);

  const handleSave = () => {
    if (forceEdit) return; // Don't save if forceEdit is enabled
    if (localValue !== value) {
      onChange(localValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!forceEdit) {
        handleSave();
      } else {
        // Save manually when forceEdit is on
        if (localValue !== value) {
          onChange(localValue);
        }
      }
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      if (!forceEdit) {
        setIsEditing(false);
      }
    }
  };

  if (isEditing) {
    return (
      <div className={`${styles.container} ${styles.containerActive} ${styles.containerActiveText}`}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>
          <textarea
            ref={textareaRef}
            className={fieldStyles.inlineTextarea}
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height =
                e.target.scrollHeight + OFFSET_HEIGHT + "px";
            }}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            rows={1}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      onClick={() => setIsEditing(true)}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>
        {value || <span className={fieldStyles.emptyState}>None</span>}
      </div>
    </div>
  );
}
