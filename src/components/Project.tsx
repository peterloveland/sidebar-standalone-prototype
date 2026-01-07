import { useState, useRef, useEffect } from 'react';
import { ActionList, AnchoredOverlay } from '@primer/react';
import { ColorBadge } from './ColorBadge';
import { ColorDot } from './ColorDot';
import { projectStatusOptions } from '../lib/db';
import styles from './Project.module.css';
import { ProjectIcon } from '@primer/octicons-react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { IconButton } from './ui/IconButton';

interface ProjectProps {
  id: string;
  name: string;
  status: string | null;
  onExpand: () => void;
  onStatusChange: (status: string | null) => void;
  onRemove?: () => void;
}

export function Project({ id, name, status, onExpand, onStatusChange, onRemove }: ProjectProps) {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const checkTruncation = () => {
      if (titleRef.current) {
        setIsTitleTruncated(titleRef.current.scrollWidth > titleRef.current.clientWidth);
      }
    };
    
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [name]);

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

  const handleProjectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProjectMenuOpen(true);
  };

  const handleGoToProject = () => {
    // In a real app, this would navigate to the project page
    window.open(`/projects/${id}`, '_blank');
    setIsProjectMenuOpen(false);
  };

  const handleViewFields = () => {
    setIsProjectMenuOpen(false);
    onExpand();
  };

  const handleRemoveProject = () => {
    setIsProjectMenuOpen(false);
    onRemove?.();
  };

  return (
    <>
      <AnchoredOverlay
        open={isProjectMenuOpen}
        onOpen={() => setIsProjectMenuOpen(true)}
        onClose={() => setIsProjectMenuOpen(false)}
        renderAnchor={({ ref, ...anchorProps }) => (
          <div
            ref={ref as React.Ref<HTMLDivElement>}
            {...anchorProps}
            className={styles.container}
            onClick={handleProjectClick}
          >
            <div className={styles.leftSection}>
              <div className={styles.icon}>
                <ProjectIcon size={16} />
              </div>
              <span 
                ref={titleRef} 
                className={styles.title}
                title={isTitleTruncated ? name : undefined}
              >
                {name}
              </span>
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
                className={styles.chevronIcon}
                icon={ChevronRight}
                size="small"
                variant="invisible"
                aria-label="View fields"
                tooltip='View fields'
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
              />
            </div>
          </div>
        )}
        side="outside-bottom"
        align="start"
      >
        <ActionList>
          <ActionList.Item onSelect={handleGoToProject}>
            <ActionList.TrailingVisual>
              <ArrowUpRight size={16} />
            </ActionList.TrailingVisual>
            Go to project
          </ActionList.Item>
          <ActionList.Item onSelect={handleViewFields}>
            View fields
          </ActionList.Item>
          <ActionList.Divider />
          <ActionList.Item variant="danger" onSelect={handleRemoveProject}>
            Remove from issue
          </ActionList.Item>
        </ActionList>
      </AnchoredOverlay>

      {isStatusMenuOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsStatusMenuOpen(false)}
          />
          <div
            className={styles.statusMenu}
            style={{
              position: "fixed",
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
