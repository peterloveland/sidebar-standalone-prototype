import { useState } from 'react';
import { X } from 'lucide-react';
import { ActionList, TextInput } from '@primer/react';
import { SidebarRow } from './SidebarRow';
import { Milestone } from './Milestone';
import { db } from '../lib/db';

interface MilestonesRowProps {
  issueId: string;
}

// Sample list of available milestones
const AVAILABLE_MILESTONES = [
  { name: 'v1.0 - Initial Release', color: '#8b5cf6' },
  { name: 'v1.1 - Feature Enhancement', color: '#8b5cf6' },
  { name: 'v1.2 - Bug Fixes', color: '#8b5cf6' },
  { name: 'v2.0 - Major Update', color: '#8b5cf6' },
  { name: 'Q1 2026', color: '#3b82f6' },
  { name: 'Q2 2026', color: '#3b82f6' },
];

// Milestone icon component (partial circle)
const MilestoneIcon = ({ color = '#8b5cf6', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export function MilestonesRow({ issueId }: MilestonesRowProps) {
  const [localMilestone, setLocalMilestone] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const issue = db.getById(issueId);

  if (!issue) {
    return null;
  }

  // Get milestone from issue (we'll store it as a string in the issue)
  const milestoneValue = (issue as any).milestone || null;

  const handleEditingChange = (isEditing: boolean) => {
    if (isEditing) {
      // When opening, set local state to current value
      setLocalMilestone(milestoneValue);
      setSearchQuery('');
    } else {
      // When closing, save to database if changed
      if (localMilestone !== milestoneValue) {
        db.update(issueId, { milestone: localMilestone } as any);
        window.dispatchEvent(new Event('storage'));
      }
      setSearchQuery('');
    }
  };

  const selectMilestone = (milestone: string | null) => {
    setLocalMilestone(milestone);
  };

  const getMilestoneColor = (milestoneName: string) => {
    return AVAILABLE_MILESTONES.find(m => m.name === milestoneName)?.color || '#8b5cf6';
  };

  // Render display function
  const renderDisplay = (value: string | null, _onChange: (newValue: string | null) => void, openEditor: () => void) => {
    if (!value) {
      return null;
    }

    const color = getMilestoneColor(value);

    return (
      <Milestone 
        name={value} 
        color={color}
        onView={() => {
          // TODO: Navigate to milestone or show details
          console.log('View milestone:', value);
        }}
        onChangeMilestone={() => {
          openEditor();
        }}
        onRemove={() => {
          db.update(issueId, { milestone: null } as any);
          window.dispatchEvent(new Event('storage'));
        }}
      />
    );
  };

  // Render editor function
  const renderEditor = (value: string | null, onChange: (newValue: string | null) => void, closeEditor: () => void) => {
    const filteredMilestones = AVAILABLE_MILESTONES.filter(milestone =>
      milestone.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div style={{ width: "296px" }}>
        <div style={{ padding: '8px' }}>
          <TextInput
            placeholder="Search milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            block
          />
        </div>
        <ActionList selectionVariant="single">
          {/* Clear selection option */}
          {(!searchQuery || 'clear milestone'.includes(searchQuery.toLowerCase())) && (
            <ActionList.Item
              key="__clear__"
              onSelect={() => {
                db.update(issueId, { milestone: null } as any);
                window.dispatchEvent(new Event('storage'));
                closeEditor();
              }}
              role="menuitemradio"
              selected={localMilestone === null}
              aria-checked={localMilestone === null}
            >
              <ActionList.LeadingVisual>
                <X size={16} />
              </ActionList.LeadingVisual>
              Clear milestone
            </ActionList.Item>
          )}
          
          {/* Milestone options */}
          {filteredMilestones.map((milestone) => (
            <ActionList.Item
              key={milestone.name}
              onSelect={() => {
                db.update(issueId, { milestone: milestone.name } as any);
                window.dispatchEvent(new Event('storage'));
                closeEditor();
              }}
              role="menuitemradio"
              selected={localMilestone === milestone.name}
              aria-checked={localMilestone === milestone.name}
            >
              <ActionList.LeadingVisual>
                <MilestoneIcon color={milestone.color} size={16} />
              </ActionList.LeadingVisual>
              {milestone.name}
            </ActionList.Item>
          ))}
          {filteredMilestones.length === 0 && searchQuery && (
            <ActionList.Item disabled>
              No matching milestones
            </ActionList.Item>
          )}
        </ActionList>
      </div>
    );
  };

  return (
    <SidebarRow
      disableClickToEdit
      noPadding
      label="Milestone"
      value={milestoneValue}
      type="single-select"
      renderDisplay={renderDisplay}
      renderEditor={renderEditor}
      onChange={(newMilestone) => {
        setLocalMilestone(newMilestone);
      }}
      onEditingChange={handleEditingChange}
    />
  );
}
