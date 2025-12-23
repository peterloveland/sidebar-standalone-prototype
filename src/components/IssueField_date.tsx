import { useState, useEffect, useRef } from 'react';
import { Tooltip } from '@primer/react';
import styles from './IssueFieldRow.module.css';
import fieldStyles from './IssueField.module.css';

interface IssueField_dateProps {
  label: string;
  value: string | null; // ISO date string
  onChange: (value: string | null) => void;
  description?: string;
  isColorAnimating?: boolean;
}

export function IssueField_date({ label, value, onChange, description, isColorAnimating = false }: IssueField_dateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (localValue !== value) {
      onChange(localValue || null);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setLocalValue(value || '');
      setIsEditing(false);
    }
  };

  const renderDisplay = (val: string | null) => {
    if (!val) return <span className={fieldStyles.emptyState}>None</span>;
    const date = new Date(val);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isEditing) {
    const displayValue = localValue ? localValue.split('T')[0] : new Date().toISOString().split('T')[0];
    
    return (
      <div className={`${styles.container} ${styles.containerActive} ${styles.containerActiveDate} ${isColorAnimating ? styles.containerColored : ''}`}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>
          <input
            ref={inputRef}
            type="date"
            className={fieldStyles.inlineInput}
            value={displayValue}
            onChange={(e) => {
              const newValue = e.target.value ? new Date(e.target.value).toISOString() : '';
              setLocalValue(newValue);
            }}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${isColorAnimating ? styles.containerColored : ''}`}
      onClick={() => setIsEditing(true)}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>
        {renderDisplay(value)}
      </div>
    </div>
  );
}
