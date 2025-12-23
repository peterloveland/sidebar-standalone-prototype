import { useState, useEffect } from 'react';
import { IssueFieldRow } from './IssueFieldRow';
import styles from './IssueField.module.css';

interface IssueField_dateProps {
  label: string;
  value: string | null; // ISO date string
  onChange: (value: string | null) => void;
}

export function IssueField_date({ label, value, onChange }: IssueField_dateProps) {
  const [localValue, setLocalValue] = useState(value || '');

  const renderDisplay = (val: string | null) => {
    if (!val) return <span className={styles.emptyState}>None</span>;
    const date = new Date(val);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderEditor = (val: string | null, onChangeCallback: (newValue: string | null) => void) => {
    return (
      <div className={styles.editorContainer}>
        <input
          type="date"
          className={styles.input}
          value={localValue ? localValue.split('T')[0] : ''}
          onChange={(e) => {
            const newValue = e.target.value ? new Date(e.target.value).toISOString() : null;
            setLocalValue(newValue || '');
            onChange(newValue);
          }}
          autoFocus
        />
      </div>
    );
  };

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  return (
    <IssueFieldRow
      label={label}
      value={value}
      renderDisplay={renderDisplay}
      renderEditor={renderEditor}
      onChange={onChange}
    />
  );
}
