import { SidebarLabel } from './SidebarLabel';
import { IssueField_text } from './IssueField_text';
import { IssueField_number } from './IssueField_number';
import { IssueField_singleSelect } from './IssueField_singleSelect';
import { IssueField_multiSelect } from './IssueField_multiSelect';
import { IssueField_date } from './IssueField_date';
import { db, type FieldDefinition } from '../lib/db';
import { useState, useEffect, useRef } from 'react';
import styles from './IssueFieldsContainer.module.css';
import { useHeightAnimation } from '../hooks/useHeightAnimation';

interface IssueFieldsContainerProps {
  issueId: string;
}

export function IssueFieldsContainer({ issueId }: IssueFieldsContainerProps) {
  const issue = db.getById(issueId);
  const [animationState, setAnimationState] = useState<'idle' | 'out' | 'in'>('idle');
  const [displayType, setDisplayType] = useState<string | undefined>(issue?.type);
  const [previousFieldIds, setPreviousFieldIds] = useState<string[]>([]);
  const [nextFieldIds, setNextFieldIds] = useState<string[]>([]);
  const previousTypeRef = useRef<string | undefined>(issue?.type);
  const isInitialMount = useRef(true);
  const [showFieldAnimations, setShowFieldAnimations] = useState(true);
  const [showColorFade, setShowColorFade] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const { lockHeight, animateToAuto, getContainerProps } = useHeightAnimation(300);

  useEffect(() => {
    if (!issue) return;

    // Skip animation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousTypeRef.current = issue.type;
      setDisplayType(issue.type);
      const typeConfig = issue.type ? db.getIssueTypeConfig(issue.type) : null;
      const fieldIds = typeConfig ? typeConfig.fieldIds : db.getDefaultFieldIds();
      setPreviousFieldIds(fieldIds);
      return;
    }

    // Check if type has changed
    if (previousTypeRef.current !== issue.type) {
      // Clear any existing timers
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
      
      // Store current field IDs before changing
      const oldTypeConfig = previousTypeRef.current ? db.getIssueTypeConfig(previousTypeRef.current) : null;
      const oldFieldIds = oldTypeConfig ? oldTypeConfig.fieldIds : db.getDefaultFieldIds();
      setPreviousFieldIds(oldFieldIds);
      
      // Store the NEW field IDs so we can compare during animation
      const newTypeConfig = issue.type ? db.getIssueTypeConfig(issue.type) : null;
      const newFieldIds = newTypeConfig ? newTypeConfig.fieldIds : db.getDefaultFieldIds();
      setNextFieldIds(newFieldIds);
      
      // Step 1: Lock the current height
      lockHeight();
      
      // Step 2: Start with slide-out animation
      setAnimationState('out');
      
      // After slide-out completes, update display type and start animating in
      const outTimer = setTimeout(() => {
        previousTypeRef.current = issue.type;
        setDisplayType(issue.type);
        
        // Start 'in' state immediately
        setAnimationState('in');
        setShowFieldAnimations(false);
        setShowColorFade(true);
        
        // Next frame, unlock height to start container animation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            animateToAuto();
            
            // Wait 200ms before animating fields in
            const fieldDelayTimer = setTimeout(() => {
              setShowFieldAnimations(true);
              
              // Remove color animation after it completes (2.6s from when animation starts)
              const colorTimer = setTimeout(() => {
                setShowColorFade(false);
              }, 2600);
              timersRef.current.push(colorTimer);
              
              // Reset to idle after slide-in completes
              const inTimer = setTimeout(() => {
                setAnimationState('idle');
              }, 600);
              timersRef.current.push(inTimer);
            }, 200); // how long after container starts animating in
            timersRef.current.push(fieldDelayTimer);
          });
        });
      }, 200); // duration of slide-out animation
      timersRef.current.push(outTimer);

      return () => {
        timersRef.current.forEach(timer => clearTimeout(timer));
        timersRef.current = [];
      };
    }
  }, [issue?.type]);

  if (!issue) {
    return null;
  }

  const updateField = (fieldName: string, value: any) => {
    db.update(issueId, {
      fields: {
        ...issue.fields,
        [fieldName]: value,
      },
    });
    window.dispatchEvent(new Event('storage'));
  };

  // Get the fields for this issue type
  const typeConfig = displayType ? db.getIssueTypeConfig(displayType) : null;
  
  // Use default fields if no type is set
  const fieldIds = typeConfig ? typeConfig.fieldIds : db.getDefaultFieldIds();
  const typeColor = typeConfig?.color;

  const fields = fieldIds
    .map(fieldId => db.getFieldDefinition(fieldId))
    .filter((field): field is FieldDefinition => field !== undefined);

  const renderField = (field: FieldDefinition) => {
    const value = issue.fields?.[field.id];
    const isColorAnimating = showColorFade;

    switch (field.type) {
      case 'text':
        return (
          <IssueField_text
            key={field.id}
            label={field.label}
            value={value || ''}
            onChange={(val) => updateField(field.id, val)}
            description={field.description}
            isColorAnimating={isColorAnimating}
          />
        );

      case 'number':
        return (
          <IssueField_number
            key={field.id}
            label={field.label}
            value={value ?? null}
            onChange={(val) => updateField(field.id, val)}
            description={field.description}
            isColorAnimating={isColorAnimating}
          />
        );

      case 'date':
        return (
          <IssueField_date
            key={field.id}
            label={field.label}
            value={value || null}
            onChange={(val) => updateField(field.id, val)}
            description={field.description}
            isColorAnimating={isColorAnimating}
          />
        );

      case 'singleSelect':
        return (
          <IssueField_singleSelect
            key={field.id}
            label={field.label}
            value={value || null}
            options={field.options || []}
            onChange={(val) => updateField(field.id, val)}
            description={field.description}
            isColorAnimating={isColorAnimating}
          />
        );

      case 'multiSelect':
        return (
          <IssueField_multiSelect
            key={field.id}
            label={field.label}
            value={value || []}
            options={field.options || []}
            onChange={(val) => updateField(field.id, val)}
            description={field.description}
            isColorAnimating={isColorAnimating}
          />
        );

      default:
        return null;
    }
  };

  const getFieldClassName = () => {
    if (animationState === 'out') {
      return styles.fieldOut;
    } else if ((animationState === 'in' || animationState === 'idle') && showColorFade) {
      return styles.fieldColored;
    } else if (animationState === 'in') {
      return styles.fieldIn;
    }
    return '';
  };

  const getColorVariable = () => {
    const colorMap: Record<string, string> = {
      red: 'var(--bgColor-closed-muted)',
      green: 'var(--bgColor-success-muted)',
      blue: 'var(--bgColor-accent-muted)',
      purple: 'var(--bgColor-done-muted)'
    };
    
    const color = typeColor ? colorMap[typeColor] : 'var(--bgColor-muted)';
    
    return {
      '--field-bg-color': color
    } as React.CSSProperties;
  };

  const containerProps = getContainerProps();

  return (
    <div>
      <SidebarLabel showPlusIcon={false}>Fields</SidebarLabel>
      <div
        {...containerProps}
        className={`${styles.fieldsContainer} ${containerProps.className}`}
      >
        {fields.map((field, index) => (
          <div
            key={`${displayType}-${field.id}`}
            className={getFieldClassName()}
            style={{
              animationPlayState: animationState === 'in' && !showFieldAnimations ? 'paused' : 'running',
              animationDelay: `${index * 20}ms`,
              ...getColorVariable()
            }}
          >
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );
}
