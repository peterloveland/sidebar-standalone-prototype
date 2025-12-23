import { useState, useEffect } from 'react';
import { ActionList } from '@primer/react';
import { IssueFieldRow } from './IssueFieldRow';
import styles from './IssueField.module.css';

interface SelectOption {
  label: string;
  value: string;
}

interface IssueField_multiSelectProps {
  label: string;
  value: string[];
  options: SelectOption[];
  onChange: (value: string[]) => void;
}

export function IssueField_multiSelect({ label, value, options, onChange }: IssueField_multiSelectProps) {
  const [localValue, setLocalValue] = useState(value);

  const renderDisplay = (val: string[]) => {
    if (!val || val.length === 0) return <span className={styles.emptyState}>None</span>;
    const labels = val.map(v => options.find(opt => opt.value === v)?.label || v);
    return labels.join(', ');
  };

  const renderEditor = (val: string[], onChangeCallback: (newValue: string[]) => void) => {
    const toggleValue = (optionValue: string) => {
      const newValue = localValue.includes(optionValue)
        ? localValue.filter(v => v !== optionValue)
        : [...localValue, optionValue];
      setLocalValue(newValue);
      onChange(newValue);
    };

    return (
      <div style={{ width: "296px" }}>
        <ActionList selectionVariant="multiple">
          {options.map((option) => (
            <ActionList.Item
              key={option.value}
              selected={localValue.includes(option.value)}
              onSelect={() => toggleValue(option.value)}
            >
              {option.label}
            </ActionList.Item>
          ))}
        </ActionList>
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
