import { useState } from 'react';
import { useIssues } from '../hooks/useIssues';
import { IssueItem } from './IssueItem';
import { IssueDetail } from './IssueDetail';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Filter, Plus } from 'lucide-react';
import { Badge } from './ui/badge';
import { ThemeSwitcher } from './ThemeSwitcher';
import styles from './IssuesSidebar.module.css';

export function IssuesSidebar() {
  const { issues, toggleIssueState } = useIssues();
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'open' | 'closed'>('all');

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.labels.some(label => label.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterState === 'all' || issue.state === filterState;
    return matchesSearch && matchesFilter;
  });

  const selectedIssue = issues.find(issue => issue.id === selectedIssueId);

  const openCount = issues.filter(i => i.state === 'open').length;
  const closedCount = issues.filter(i => i.state === 'closed').length;

  return (
    <div className={styles.container}>
      {/* Issues List */}
      <div className={styles.sidebar}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>Issues</h1>
            <div className={styles.headerActions}>
              <ThemeSwitcher />
              <Button size="sm" variant="default">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <Input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Tabs */}
          <div className={styles.filters}>
            <Button
              variant={filterState === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterState('all')}
              className="flex-1"
            >
              All
              <Badge variant="secondary" className="ml-2">
                {issues.length}
              </Badge>
            </Button>
            <Button
              variant={filterState === 'open' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterState('open')}
              className="flex-1"
            >
              Open
              <Badge variant="secondary" className="ml-2">
                {openCount}
              </Badge>
            </Button>
            <Button
              variant={filterState === 'closed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterState('closed')}
              className="flex-1"
            >
              Closed
              <Badge variant="secondary" className="ml-2">
                {closedCount}
              </Badge>
            </Button>
          </div>
        </div>

        {/* Issues List */}
        <div className={styles.issuesList}>
          {filteredIssues.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No issues found</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <IssueItem
                key={issue.id}
                issue={issue}
                onClick={() => setSelectedIssueId(issue.id)}
                isSelected={issue.id === selectedIssueId}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className={styles.detailPanel}>
        {selectedIssue ? (
          <IssueDetail
            issue={selectedIssue}
            onToggleState={() => toggleIssueState(selectedIssue.id)}
            onClose={() => setSelectedIssueId(null)}
          />
        ) : (
          <div className={styles.detailEmpty}>
            <div className={styles.detailEmptyContent}>
              <Filter className={styles.detailEmptyIcon} />
              <p className={styles.detailEmptyText}>Select an issue to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
