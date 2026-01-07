import { useState, useRef, useEffect } from 'react';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { ActionList, IconButton } from '@primer/react';
import { ColorBadge } from './ColorBadge';
import { ColorDot } from './ColorDot';
import { projectStatusOptions } from '../lib/db';
import styles from './Project.module.css';
import { ProjectIcon } from '@primer/octicons-react';

interface ProjectProps {
  id: string;
  name: string;
  status: string | null;
  onExpand: () => void;
  onStatusChange: (status: string | null) => void;
}

export function Project({ id, name, status, onExpand, onStatusChange }: ProjectProps) {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isStatusMenuOpen && statusButtonRef.current) {
      const rect = statusButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [isStatusMenuOpen]);

  const getStatusDisplay = () => {
    if (!status) {
      return <span className={styles.status}>No status</span>;
    }
    const option = projectStatusOptions.find(opt => opt.value === status);
    if (!option) return status;
    return <ColorBadge color={option.color}>{option.label}</ColorBadge>;
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStatusMenuOpen(!isStatusMenuOpen);
  };

  const handleStatusSelect = (newStatus: string | null) => {
    onStatusChange(newStatus);
    setIsStatusMenuOpen(false);
  };

  return (
    <>
      <div className={styles.container} onClick={onExpand}>
        <div className={styles.leftSection}>
          <div className={styles.icon}>
            <ProjectIcon size={16} />
          </div>
          <span className={styles.title}>{name}</span>
        </div>
        <div className={styles.rightSection}>
          <button
            ref={statusButtonRef}
            className={styles.statusButton}
            onClick={handleStatusClick}
          >
            {getStatusDisplay()}
          </button>
          <IconButton
            size='small'
            variant='invisible'
            aria-label="Expand project details"
            onClick={(e) => {
                e.stopPropagation();
                onExpand();
            }}
            >
            <LayoutGrid size={16} />
          </IconButton>

        </div>
      </div>

      {isStatusMenuOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsStatusMenuOpen(false)}
          />
          <div
            className={styles.statusMenu}
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ActionList selectionVariant="single">
              <ActionList.Item
                onSelect={() => handleStatusSelect(null)}
                role="menuitemradio"
                selected={status === null}
                aria-checked={status === null}
              >
                Clear status
              </ActionList.Item>
              {projectStatusOptions.map((option) => (
                <ActionList.Item
                  key={option.value}
                  onSelect={() => handleStatusSelect(option.value)}
                  role="menuitemradio"
                  selected={status === option.value}
                  aria-checked={status === option.value}
                >
                  <ActionList.LeadingVisual>
                    <ColorDot color={option.color} />
                  </ActionList.LeadingVisual>
                  {option.label}
                </ActionList.Item>
              ))}
            </ActionList>
          </div>
        </>
      )}
    </>
  );
}
