import { useState, useRef, useEffect } from 'react';
import { Tag, X } from 'lucide-react';
import { ActionList } from '@primer/react';
import { SidebarRow } from './SidebarRow';
import { Badge } from './ui/badge';
import { db } from '../lib/db';
import styles from './IssueSidebar.module.css';

interface LabelsRowProps {
  issueId: string;
}

// Sample list of available labels
const AVAILABLE_LABELS = [
  { name: 'bug', color: '#d73a4a' },
  { name: 'documentation', color: '#0075ca' },
  { name: 'enhancement', color: '#a2eeef' },
  { name: 'good first issue', color: '#7057ff' },
  { name: 'help wanted', color: '#008672' },
  { name: 'invalid', color: '#e4e669' },
  { name: 'question', color: '#d876e3' },
  { name: 'wontfix', color: '#ffffff' },
  { name: 'mobile', color: '#fbca04' },
  { name: 'performance', color: '#ff6b6b' },
];

export function LabelsRow({ issueId }: LabelsRowProps) {
  const [clickedLabel, setClickedLabel] = useState<string | null>(null);
  const [localLabels, setLocalLabels] = useState<string[]>([]);
  const [hoverCardPosition, setHoverCardPosition] = useState({ top: 0, left: 0 });
  const chipRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const prevLabelsRef = useRef<string[]>([]);
  const newLabelIndicesRef = useRef<Map<string, number>>(new Map());
  const issue = db.getById(issueId);

  useEffect(() => {
    if (clickedLabel && chipRefs.current[clickedLabel]) {
      const rect = chipRefs.current[clickedLabel]!.getBoundingClientRect();
      setHoverCardPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [clickedLabel]);

  if (!issue) {
    return null;
  }

  const labelsValue = issue.labels || [];

  const handleEditingChange = (isEditing: boolean) => {
    if (isEditing) {
      // When opening, set local state to current value
      setLocalLabels(labelsValue);
    } else {
      // When closing, save to database if changed
      if (JSON.stringify(localLabels) !== JSON.stringify(labelsValue)) {
        db.update(issueId, { labels: localLabels });
        window.dispatchEvent(new Event('storage'));
      }
    }
  };

  const toggleLabel = (label: string) => {
    const newLabels = localLabels.includes(label)
      ? localLabels.filter(l => l !== label)
      : [...localLabels, label];
    
    setLocalLabels(newLabels);
  };

  const removeLabel = (label: string) => {
    // Directly update the database
    const newLabels = labelsValue.filter(l => l !== label);
    
    db.update(issueId, { labels: newLabels });
    window.dispatchEvent(new Event('storage'));
    setClickedLabel(null);
  };

  const isSelected = (label: string) => {
    return localLabels.includes(label);
  };

  const getLabelColor = (labelName: string) => {
    return AVAILABLE_LABELS.find(l => l.name === labelName)?.color || '#808080';
  };

  // Render display function
  const renderDisplay = (labels: string[]) => {
    if (labels.length === 0) {
      return null;
    }

    // Find newly added labels and assign them indices
    const newLabels = labels.filter(label => !prevLabelsRef.current.includes(label));
    
    // Assign indices to new labels
    newLabels.forEach((label, index) => {
      if (!newLabelIndicesRef.current.has(label)) {
        newLabelIndicesRef.current.set(label, index);
      }
    });
    
    // Clean up indices for removed labels
    prevLabelsRef.current.forEach(label => {
      if (!labels.includes(label)) {
        newLabelIndicesRef.current.delete(label);
      }
    });
    
    prevLabelsRef.current = labels;

    return (
      <div className={styles.multipleListContainer}>
        {labels.map((label) => {
          const color = getLabelColor(label);
          const newLabelIndex = newLabelIndicesRef.current.get(label);
          const hasDelay = newLabelIndex !== undefined;
          
          return (
            <div
              key={label}
              ref={(el) => chipRefs.current[label] = el}
              style={{ 
                cursor: 'pointer', 
                position: 'relative',
                display: 'inline-block',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setClickedLabel(clickedLabel === label ? null : label);
              }}
            >
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0"
                style={{
                  backgroundColor: color,
                  color: getContrastColor(color),
                  borderColor: color,
                  transitionDelay: hasDelay ? `${newLabelIndex * 0.025}s` : '0s'
                }}
              >
                {label}
              </Badge>
              
              {clickedLabel === label && (
                <>
                  <div 
                    className={styles.hoverBackdrop}
                    onClick={(e) => {
                      e.stopPropagation();
                      setClickedLabel(null);
                    }}
                  />
                  <div 
                    className={styles.hoverCard}
                    style={{
                      top: `${hoverCardPosition.top}px`,
                      left: `${hoverCardPosition.left}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.hoverCardHeader}>
                      <div 
                        className={styles.hoverCardAvatar}
                        style={{ 
                          backgroundColor: color,
                          borderRadius: '4px',
                        }}
                      >
                        <Tag className={styles.hoverCardAvatarIcon} style={{ color: getContrastColor(color) }} />
                      </div>
                      <div className={styles.hoverCardInfo}>
                        <div className={styles.hoverCardName}>{label}</div>
                        <div className={styles.hoverCardRole}>Label</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLabel(label);
                      }}
                      className={styles.removeButton}
                    >
                      Remove label
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render editor function
  const renderEditor = (labels: string[]) => {
    // Use labelsValue (initial state) for grouping, not localLabels
    const selectedLabels = AVAILABLE_LABELS.filter(label => labelsValue.includes(label.name));
    const unselectedLabels = AVAILABLE_LABELS.filter(label => !labelsValue.includes(label.name));
    
    return (
      <div style={{ width: "296px" }}>
        {/* Selected items at the top */}
        {selectedLabels.length > 0 && (
          <ActionList selectionVariant="multiple">
            {selectedLabels.map((label) => (
              <ActionList.Item
                key={label.name}
                onSelect={() => toggleLabel(label.name)}
                role="menuitemradio"
                selected={isSelected(label.name)}
                aria-checked={isSelected(label.name)}
              >
                <ActionList.LeadingVisual>
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: label.color,
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  />
                </ActionList.LeadingVisual>
                {label.name}
              </ActionList.Item>
            ))}
          </ActionList>
        )}

        {/* Unselected labels */}
        <ActionList selectionVariant="multiple">
          {unselectedLabels.map((label) => (
            <ActionList.Item
              key={label.name}
              onSelect={() => toggleLabel(label.name)}
              role="menuitemradio"
              selected={isSelected(label.name)}
              aria-checked={isSelected(label.name)}
            >
              <ActionList.LeadingVisual>
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: label.color,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
              </ActionList.LeadingVisual>
              {label.name}
            </ActionList.Item>
          ))}
        </ActionList>
      </div>
    );
  };

  return (
    <SidebarRow
      label="Labels"
      value={labelsValue}
      type="multi-select"
      renderDisplay={renderDisplay}
      renderEditor={renderEditor}
      onChange={(newLabels) => {
        setLocalLabels(newLabels);
      }}
      onEditingChange={handleEditingChange}
    />
  );
}

// Helper function to determine if we should use light or dark text based on background color
function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
