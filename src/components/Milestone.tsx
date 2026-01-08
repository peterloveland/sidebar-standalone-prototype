import { useState } from 'react';
import { ActionList, AnchoredOverlay } from '@primer/react';
import styles from './Milestone.module.css';

interface MilestoneProps {
  name: string;
  color?: string;
  onRemove?: () => void;
  onView?: () => void;
  onChangeMilestone?: () => void;
}

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

export function Milestone({ name, color = '#8b5cf6', onRemove, onView, onChangeMilestone }: MilestoneProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AnchoredOverlay
      open={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      renderAnchor={(props) => (
        <ActionList variant="full">
          <ActionList.Item {...props} className={isOpen ? styles.milestoneActive : ''}>
            <ActionList.LeadingVisual>
              <MilestoneIcon color={color} size={16} />
            </ActionList.LeadingVisual>
            <span className={styles.milestoneName}>{name}</span>
          </ActionList.Item>
        </ActionList>
      )}
      side="outside-bottom"
      align="start"
    >
      <ActionList>
        {onView && (
          <ActionList.Item
            onSelect={() => {
              onView();
              setIsOpen(false);
            }}
          >
            View milestone
          </ActionList.Item>
        )}
        {onChangeMilestone && (
          <ActionList.Item
            onSelect={() => {
              onChangeMilestone();
              setIsOpen(false);
            }}
          >
            Change milestone
          </ActionList.Item>
        )}
        {onRemove && (
          <ActionList.Item
            variant='danger'
            onSelect={() => {
              onRemove();
              setIsOpen(false);
            }}
          >
            Remove milestone
          </ActionList.Item>
        )}
      </ActionList>
    </AnchoredOverlay>
  );
}
