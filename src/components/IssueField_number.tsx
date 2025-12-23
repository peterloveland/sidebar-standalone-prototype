import { useState, useEffect } from 'react';
import { IssueFieldRow } from './IssueFieldRow';
import styles from './IssueField.module.css';

interface IssueField_numberProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function IssueField_number({ label, value, onChange }: IssueField_numberProps) {
  const [localValue, setLocalValue] = useState(value?.toString() || '');

  const renderDisplay = (val: number | null) => {
    return val !== null ? val : <span className={styles.emptyState}>None</span>;
  };

  const renderEditor = (val: number | null, onChangeCallback: (newValue: number | null) => void) => {
    return (
      <div className={styles.editorContainer}>
        <input
          type="number"
          className={styles.input}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => {
            const numValue = localValue === '' ? null : Number(localValue);
            if (numValue !== value) {
              onChange(numValue);
            }
          }}
          autoFocus
        />
      </div>
    );
  };

  useEffect(() => {
    setLocalValue(value?.toString() || '');
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
