import { useState, useEffect } from 'react';
import { IssueFieldRow } from './IssueFieldRow';
import styles from './IssueField.module.css';

interface IssueField_textProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function IssueField_text({ label, value, onChange }: IssueField_textProps) {
  const [localValue, setLocalValue] = useState(value);

  const renderDisplay = (val: string) => {
    return val || <span className={styles.emptyState}>None</span>;
  };

  const renderEditor = (val: string, onChangeCallback: (newValue: string) => void) => {
    return (
      <div className={styles.editorContainer}>
        <textarea
          className={styles.textarea}
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onBlur={() => {
            if (localValue !== value) {
              onChange(localValue);
            }
          }}
          autoFocus
          rows={1}
        />
      </div>
    );
  };

  useEffect(() => {
    setLocalValue(value);
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
