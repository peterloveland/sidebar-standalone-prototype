import { useState, useEffect, useRef } from 'react';
import styles from './IssueFieldRow.module.css';
import fieldStyles from './IssueField.module.css';

interface IssueField_numberProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function IssueField_number({ label, value, onChange }: IssueField_numberProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value?.toString() || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleSave = () => {
    const numValue = localValue === '' ? null : Number(localValue);
    if (numValue !== value) {
      onChange(numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setLocalValue(value?.toString() || '');
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow empty string, numbers, and minus sign
    if (newValue === '' || newValue === '-' || /^-?\d*\.?\d*$/.test(newValue)) {
      setLocalValue(newValue);
    }
  };

  if (isEditing) {
    return (
      <div className={`${styles.container} ${styles.containerActive} ${styles.containerActiveText}`}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>
          <input
            ref={inputRef}
            type="text"
            className={fieldStyles.inlineTextarea}
            value={localValue}
            onChange={handleChange}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
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
        {value !== null ? value : <span className={fieldStyles.emptyState}>None</span>}
      </div>
    </div>
  );
}
