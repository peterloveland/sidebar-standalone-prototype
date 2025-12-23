import type { Issue, IssueType } from '../lib/db';
import { db } from '../lib/db';
import { CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CircleDot, CheckCircle2, Calendar, User, MessageSquare, ChevronDown } from 'lucide-react';
import { IssueSidebar } from './IssueSidebar';
import { AnchoredOverlay, ActionList, CounterLabel } from '@primer/react';
import { ColorDot } from './ColorDot';
import { useState } from 'react';
import styles from './IssueDetail.module.css';

interface IssueDetailProps {
  issue: Issue;
  onToggleState: () => void;
  onClose: () => void;
}

export function IssueDetail({ issue, onToggleState, onClose }: IssueDetailProps) {
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTypeChange = (newType: IssueType | '') => {
    db.update(issue.id, { type: newType || undefined });
    window.dispatchEvent(new Event('storage'));
    setIsTypeOpen(false);
  };

  const issueTypes = db.getIssueTypes();
  const currentTypeConfig = issue.type ? issueTypes.find(t => t.type === issue.type) : null;

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
              <AnchoredOverlay
                open={isTypeOpen}
                onOpen={() => setIsTypeOpen(true)}
                onClose={() => setIsTypeOpen(false)}
                renderAnchor={(anchorProps) => (
                  <button
                    {...anchorProps}
                    className={styles.typeSelector}
                    onClick={() => setIsTypeOpen(!isTypeOpen)}
                  >
                    {currentTypeConfig && (
                      <ColorDot color={currentTypeConfig.color} />
                    )}
                    <span>{currentTypeConfig?.label || '(No type)'}</span>
                    <ChevronDown size={14} />
                  </button>
                )}
                side="outside-bottom"
                align="start"
              >
                <div style={{ width: "200px" }}>
                  <ActionList selectionVariant="single">
                    <ActionList.Item
                      role="menuitemradio"
                      selected={!issue.type}
                      aria-checked={!issue.type}
                      onSelect={() => handleTypeChange('')}
                    >
                      <ActionList.LeadingVisual>
                        <ColorDot color="gray" />
                      </ActionList.LeadingVisual>
                      (No type)
                      <ActionList.TrailingVisual>
                        <CounterLabel>
                          {db.getDefaultFieldIds().length} fields
                        </CounterLabel>
                      </ActionList.TrailingVisual>
                    </ActionList.Item>
                    {issueTypes.map((typeConfig) => (
                      <ActionList.Item
                        key={typeConfig.type}
                        role="menuitemradio"
                        selected={issue.type === typeConfig.type}
                        aria-checked={issue.type === typeConfig.type}
                        onSelect={() => handleTypeChange(typeConfig.type)}
                      >
                        <ActionList.LeadingVisual>
                          <ColorDot color={typeConfig.color} />
                        </ActionList.LeadingVisual>
                        {typeConfig.label}
                        <ActionList.TrailingVisual>
                          <CounterLabel>
                            {typeConfig.fieldIds.length} fields
                          </CounterLabel>
                        </ActionList.TrailingVisual>
                      </ActionList.Item>
                    ))}
                  </ActionList>
                </div>
              </AnchoredOverlay>
            </div>
            <CardTitle className={styles.title}>{issue.title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>

      <div className={styles.mainContent}>
        {/* <CardContent className={styles.content}>
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
        </CardContent> */}

        <div className={styles.sidebar}>
          <IssueSidebar issueId={issue.id} />
        </div>
      </div>
    </div>
  );
}
