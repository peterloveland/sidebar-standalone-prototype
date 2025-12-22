import type { Issue } from '../lib/db';
import { CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CircleDot, CheckCircle2, Calendar, User, MessageSquare } from 'lucide-react';
import { IssueSidebar } from './IssueSidebar';
import styles from './IssueDetail.module.css';

interface IssueDetailProps {
  issue: Issue;
  onToggleState: () => void;
  onClose: () => void;
}

export function IssueDetail({ issue, onToggleState, onClose }: IssueDetailProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <CardHeader className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.statusRow}>
              {issue.state === 'open' ? (
                <CircleDot className={styles.iconOpen} />
              ) : (
                <CheckCircle2 className={styles.iconClosed} />
              )}
              <Badge variant={issue.state === 'open' ? 'default' : 'secondary'}>
                {issue.state}
              </Badge>
              <span className={styles.issueNumber}>#{issue.number}</span>
            </div>
            <CardTitle className={styles.title}>{issue.title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>

      <div className={styles.mainContent}>
        <CardContent className={styles.content}>
          <div className={styles.sections}>
            {issue.description && (
              <div>
                <h3>Description</h3>
                <p className={styles.description}>{issue.description}</p>
              </div>
            )}

            <div className={styles.grid}>
              <div>
                <div className={styles.metaLabel}>
                  <User />
                  <span>Assignees</span>
                </div>
                <p className={styles.metaValue}>
                  {issue.assignees && issue.assignees.length > 0 
                    ? issue.assignees.join(', ')
                    : 'Unassigned'}
                </p>
              </div>

              <div>
                <div className={styles.metaLabel}>
                  <MessageSquare />
                  <span>Agents</span>
                </div>
                <p className={styles.metaValue}>
                  {issue.agents && issue.agents.length > 0 
                    ? issue.agents.join(', ')
                    : 'None'}
                </p>
              </div>
            </div>

            <div className={styles.grid}>
              <div>
                <div className={styles.metaLabel}>
                  <MessageSquare />
                  <span>Comments</span>
                </div>
                <p className={styles.metaValue}>{issue.comments}</p>
              </div>
            </div>

            <div>
              <div className={styles.metaLabel}>
                <Calendar />
                <span>Timeline</span>
              </div>
              <div className={styles.timeline}>
                <p>Created: {formatDate(issue.createdAt)}</p>
                <p>Updated: {formatDate(issue.updatedAt)}</p>
              </div>
            </div>

            {issue.labels.length > 0 && (
              <div>
                <h3>Labels</h3>
                <div className={styles.labels}>
                  {issue.labels.map((label) => (
                    <Badge key={label} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.actions}>
              <Button
                onClick={onToggleState}
                variant="outline"
                className={styles.toggleButton}
              >
                {issue.state === 'open' ? 'Close issue' : 'Reopen issue'}
              </Button>
            </div>
          </div>
        </CardContent>

        <div className={styles.sidebar}>
          <IssueSidebar issueId={issue.id} />
        </div>
      </div>
    </div>
  );
}
