import { useState, useEffect, useRef } from 'react';
import styles from './IssueFieldRow.module.css';
import fieldStyles from './IssueField.module.css';

interface IssueField_textProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function IssueField_text({ label, value, onChange }: IssueField_textProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleSave = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`${styles.container} ${styles.containerActive}`}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>
          <textarea
            ref={textareaRef}
            className={fieldStyles.inlineTextarea}
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
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
