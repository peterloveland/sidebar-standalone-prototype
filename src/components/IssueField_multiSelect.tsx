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

interface IssueField_multiSelectProps {
  label: string;
  value: string[];
  options: SelectOption[];
  onChange: (value: string[]) => void;
  description?: string;
  isColorAnimating?: boolean;
}

export function IssueField_multiSelect({ label, value, options, onChange, description, isColorAnimating = false }: IssueField_multiSelectProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleEditingChange = (isEditing: boolean) => {
    if (isEditing) {
      // When opening, set local state to current value
      setLocalValue(value);
    } else {
      // When closing, save changes if different
      if (JSON.stringify(localValue) !== JSON.stringify(value)) {
        onChange(localValue);
      }
    }
  };

  const renderDisplay = (val: string[], _onChange: (val: string[]) => void, _openEditor: () => void) => {
    if (!val || val.length === 0) return <span className={styles.emptyState}>None</span>;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {val.map(v => {
          const option = options.find(opt => opt.value === v);
          if (!option) return null;
          return (
            <ColorBadge key={v} color={option.color}>
              {option.label}
            </ColorBadge>
          );
        })}
      </div>
    );
  };

  const renderEditor = (val: string[], onChangeCallback: (newValue: string[]) => void, onClose: () => void) => {
    const toggleValue = (optionValue: string) => {
      const newValue = localValue.includes(optionValue)
        ? localValue.filter(v => v !== optionValue)
        : [...localValue, optionValue];
      setLocalValue(newValue);
    };

    return (
      <div style={{ width: "296px" }}>
        <ActionList selectionVariant="multiple">
          {options.map((option) => (
            <ActionList.Item
              key={option.value}
              role="menuitemradio"
              selected={localValue.includes(option.value)}
              aria-checked={localValue.includes(option.value)}
              onSelect={() => toggleValue(option.value)}
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
      onEditingChange={handleEditingChange}
      className={rowStyles.containerSelect}
      description={description}
      isColorAnimating={isColorAnimating}
    />
  );
}
