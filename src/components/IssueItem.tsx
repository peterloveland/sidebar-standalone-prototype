import type { Issue } from '../lib/db';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { MessageSquare, CircleDot, CheckCircle2, User } from 'lucide-react';
import { cn } from '../lib/utils';
import styles from './IssueItem.module.css';

interface IssueItemProps {
  issue: Issue;
  onClick: () => void;
  isSelected: boolean;
}

export function IssueItem({ issue, onClick, isSelected }: IssueItemProps) {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card
      className={cn(
        styles.card,
        isSelected && styles.cardSelected
      )}
      onClick={onClick}
    >
      <div className={styles.content}>
        <div className={cn(styles.icon, issue.state === 'open' ? styles.iconOpen : styles.iconClosed)}>
          {issue.state === 'open' ? (
            <CircleDot />
          ) : (
            <CheckCircle2 />
          )}
        </div>
        
        <div className={styles.main}>
          <div className={styles.header}>
            <h3 className={styles.title}>
              {issue.title}
            </h3>
            {issue.assignees && issue.assignees.length > 0 && (
              <div className={styles.assignees}>
                {issue.assignees.slice(0, 3).map((assignee) => (
                  <div
                    key={assignee}
                    className={styles.assignee}
                    title={assignee}
                  >
                    <User className={styles.assigneeIcon} />
                  </div>
                ))}
                {issue.assignees.length > 3 && (
                  <div className={styles.assigneeMore}>
                    +{issue.assignees.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className={styles.meta}>
            <span>#{issue.number}</span>
            <span>•</span>
            <span>{timeAgo(issue.updatedAt)}</span>
            {issue.comments > 0 && (
              <>
                <span>•</span>
                <div className={styles.metaComments}>
                  <MessageSquare className={styles.metaIcon} />
                  <span>{issue.comments}</span>
                </div>
              </>
            )}
          </div>
          
          {issue.labels.length > 0 && (
            <div className={styles.labels}>
              {issue.labels.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="text-xs px-2 py-0"
                >
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
