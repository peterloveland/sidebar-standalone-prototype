import { useState, useEffect } from 'react';
import { ActionList } from '@primer/react';
import { ColorBadge } from './ColorBadge';
import { ColorDot } from './ColorDot';
import { IssueFieldRow } from './IssueFieldRow';
import styles from './IssueField.module.css';
import rowStyles from './IssueFieldRow.module.css';

interface SelectOption {
  label: string;
  value: string;
  color: string;
}

interface IssueField_singleSelectProps {
  label: string;
  value: string | null;
  options: SelectOption[];
  onChange: (value: string | null) => void;
}

export function IssueField_singleSelect({ label, value, options, onChange }: IssueField_singleSelectProps) {
  const [localValue, setLocalValue] = useState(value);

  const renderDisplay = (val: string | null) => {
    if (!val) return <span className={styles.emptyState}>None</span>;
    const option = options.find(opt => opt.value === val);
    if (!option) return val;
    return (
      <ColorBadge color={option.color}>
        {option.label}
      </ColorBadge>
    );
  };

  const renderEditor = (val: string | null, onChangeCallback: (newValue: string | null) => void, onClose: () => void) => {
    return (
      <div style={{ width: "296px" }}>
        <ActionList selectionVariant="single">
          {options.map((option) => (
            <ActionList.Item
              key={option.value}
              role="menuitemradio"
              selected={localValue === option.value}
              aria-checked={localValue === option.value}
              onSelect={() => {
                setLocalValue(option.value);
                onChange(option.value);
                onClose();
              }}
            >
              <ActionList.LeadingVisual>
                <ColorDot color={option.color} />
              </ActionList.LeadingVisual>
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
      className={rowStyles.containerSelect}
    />
  );
}
