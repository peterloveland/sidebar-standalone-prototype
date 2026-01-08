import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Plus } from 'lucide-react';
import { ActionList, AnchoredOverlay, TextInput, Button } from '@primer/react';
import { IssueOpenedIcon, IssueClosedIcon } from '@primer/octicons-react';
import { SidebarLabel } from './SidebarLabel';
import { db } from '../lib/db';
import styles from './Project.module.css';

interface RelationshipsRowProps {
  issueId: string;
}

type RelationshipType = 'parent' | 'blocked-by' | 'blocking';

interface RelatedIssue {
  id: string;
  number: number;
  title: string;
  state: 'open' | 'closed';
}

// 20 fake issues for relationship selection
const AVAILABLE_ISSUES: RelatedIssue[] = [
  { id: 'rel-1', number: 101, title: 'Implement user authentication flow', state: 'open' },
  { id: 'rel-2', number: 102, title: 'Design system component library', state: 'open' },
  { id: 'rel-3', number: 103, title: 'API rate limiting implementation', state: 'open' },
  { id: 'rel-4', number: 104, title: 'Database schema migration', state: 'closed' },
  { id: 'rel-5', number: 105, title: 'Add unit tests for core modules', state: 'open' },
  { id: 'rel-6', number: 106, title: 'Refactor legacy payment system', state: 'open' },
  { id: 'rel-7', number: 107, title: 'Implement SSO integration', state: 'open' },
  { id: 'rel-8', number: 108, title: 'Mobile responsive redesign', state: 'closed' },
  { id: 'rel-9', number: 109, title: 'Performance optimization for dashboard', state: 'open' },
  { id: 'rel-10', number: 110, title: 'Add analytics tracking', state: 'open' },
  { id: 'rel-11', number: 111, title: 'Implement notification system', state: 'open' },
  { id: 'rel-12', number: 112, title: 'User profile page redesign', state: 'closed' },
  { id: 'rel-13', number: 113, title: 'Add export to CSV feature', state: 'open' },
  { id: 'rel-14', number: 114, title: 'Implement search functionality', state: 'open' },
  { id: 'rel-15', number: 115, title: 'Dark mode improvements', state: 'open' },
  { id: 'rel-16', number: 116, title: 'Accessibility audit fixes', state: 'open' },
  { id: 'rel-17', number: 117, title: 'Add keyboard shortcuts', state: 'closed' },
  { id: 'rel-18', number: 118, title: 'Implement undo/redo functionality', state: 'open' },
  { id: 'rel-19', number: 119, title: 'File upload optimization', state: 'open' },
  { id: 'rel-20', number: 120, title: 'WebSocket real-time updates', state: 'open' },
];

interface Relationships {
  parent: string | null;
  blockedBy: string[];
  blocking: string[];
}

const STORAGE_KEY_PREFIX = 'issue-relationships-';

function getRelationships(issueId: string): Relationships {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + issueId);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading relationships:', error);
  }
  return { parent: null, blockedBy: [], blocking: [] };
}

function saveRelationships(issueId: string, relationships: Relationships): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + issueId, JSON.stringify(relationships));
  } catch (error) {
    console.error('Error saving relationships:', error);
  }
}

function getIssueById(id: string): RelatedIssue | undefined {
  return AVAILABLE_ISSUES.find(issue => issue.id === id);
}

export function RelationshipsRow({ issueId }: RelationshipsRowProps) {
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);
  const [selectedType, setSelectedType] = useState<RelationshipType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [relationships, setRelationships] = useState<Relationships>(() => getRelationships(issueId));
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const issue = db.getById(issueId);

  if (!issue) {
    return null;
  }

  const handleToggleRelationship = (relatedIssueId: string, type: RelationshipType) => {
    const newRelationships = { ...relationships };
    
    if (type === 'parent') {
      // For parent, toggle between this issue and null
      if (newRelationships.parent === relatedIssueId) {
        newRelationships.parent = null;
      } else {
        newRelationships.parent = relatedIssueId;
      }
    } else if (type === 'blocked-by') {
      if (newRelationships.blockedBy.includes(relatedIssueId)) {
        newRelationships.blockedBy = newRelationships.blockedBy.filter(id => id !== relatedIssueId);
      } else {
        newRelationships.blockedBy = [...newRelationships.blockedBy, relatedIssueId];
      }
    } else if (type === 'blocking') {
      if (newRelationships.blocking.includes(relatedIssueId)) {
        newRelationships.blocking = newRelationships.blocking.filter(id => id !== relatedIssueId);
      } else {
        newRelationships.blocking = [...newRelationships.blocking, relatedIssueId];
      }
    }
    
    setRelationships(newRelationships);
    saveRelationships(issueId, newRelationships);
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddRelationship = (relatedIssueId: string, type: RelationshipType) => {
    const newRelationships = { ...relationships };
    
    if (type === 'parent') {
      newRelationships.parent = relatedIssueId;
    } else if (type === 'blocked-by') {
      if (!newRelationships.blockedBy.includes(relatedIssueId)) {
        newRelationships.blockedBy = [...newRelationships.blockedBy, relatedIssueId];
      }
    } else if (type === 'blocking') {
      if (!newRelationships.blocking.includes(relatedIssueId)) {
        newRelationships.blocking = [...newRelationships.blocking, relatedIssueId];
      }
    }
    
    setRelationships(newRelationships);
    saveRelationships(issueId, newRelationships);
    window.dispatchEvent(new Event('storage'));
    
    if (type === 'parent') {
      setIsAddingRelationship(false);
      setSelectedType(null);
    }
  };

  const handleRemoveRelationship = (relatedIssueId: string, type: RelationshipType) => {
    const newRelationships = { ...relationships };
    
    if (type === 'parent') {
      newRelationships.parent = null;
    } else if (type === 'blocked-by') {
      newRelationships.blockedBy = newRelationships.blockedBy.filter(id => id !== relatedIssueId);
    } else if (type === 'blocking') {
      newRelationships.blocking = newRelationships.blocking.filter(id => id !== relatedIssueId);
    }
    
    setRelationships(newRelationships);
    saveRelationships(issueId, newRelationships);
    window.dispatchEvent(new Event('storage'));
  };

  const getFilteredIssuesForType = (type: RelationshipType) => {
    const currentIssueId = issueId;
    
    return AVAILABLE_ISSUES.filter(issue => 
      issue.id !== currentIssueId &&
      (issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       issue.number.toString().includes(searchQuery))
    );
  };

  const isIssueSelected = (issueIdToCheck: string, type: RelationshipType): boolean => {
    if (type === 'parent') {
      return relationships.parent === issueIdToCheck;
    } else if (type === 'blocked-by') {
      return relationships.blockedBy.includes(issueIdToCheck);
    } else if (type === 'blocking') {
      return relationships.blocking.includes(issueIdToCheck);
    }
    return false;
  };

  const hasRelationships = relationships.parent || relationships.blockedBy.length > 0 || relationships.blocking.length > 0;

  const renderRelationshipItem = (relatedIssueId: string, type: RelationshipType) => {
    const relatedIssue = getIssueById(relatedIssueId);
    if (!relatedIssue) return null;

    const menuId = `${type}-${relatedIssueId}`;
    const isMenuOpen = openMenuId === menuId;

    const handleOpenIssue = () => {
      // In a real app, this would navigate to the issue
      window.open(`/issues/${relatedIssue.number}`, '_blank');
      setOpenMenuId(null);
    };

    const handleRemove = () => {
      handleRemoveRelationship(relatedIssueId, type);
      setOpenMenuId(null);
    };

    const handleChangeParent = () => {
      setOpenMenuId(null);
      setSelectedType('parent');
      setSearchQuery('');
      setIsAddingRelationship(true);
    };

    return (
      <AnchoredOverlay
        key={menuId}
        open={isMenuOpen}
        onOpen={() => setOpenMenuId(menuId)}
        onClose={() => setOpenMenuId(null)}
        renderAnchor={({ ref, ...anchorProps }) => (
          <div
            ref={ref as React.Ref<HTMLDivElement>}
            {...anchorProps}
            className={styles.container}
            style={isMenuOpen ? { backgroundColor: 'var(--control-bgColor-active)' } : undefined}
            onClick={() => setOpenMenuId(isMenuOpen ? null : menuId)}
          >
            <div className={styles.leftSection}>
              <div className={styles.icon} style={{ color: relatedIssue.state === 'open' ? 'var(--color-open-fg, #1a7f37)' : 'var(--color-closed-fg, #8250df)' }}>
                {relatedIssue.state === 'open' ? (
                  <IssueOpenedIcon size={16} />
                ) : (
                  <IssueClosedIcon size={16} />
                )}
              </div>
              <span className={styles.title}>
                #{relatedIssue.number} {relatedIssue.title}
              </span>
            </div>
          </div>
        )}
        side="outside-bottom"
        align="start"
      >
        <ActionList>
          <ActionList.Item onSelect={handleOpenIssue}>
            <ActionList.TrailingVisual>
              <ArrowUpRight size={16} />
            </ActionList.TrailingVisual>
            Open issue
          </ActionList.Item>
          {type === 'parent' && (
            <ActionList.Item onSelect={handleChangeParent}>
              Change parent
            </ActionList.Item>
          )}
          <ActionList.Divider />
          <ActionList.Item variant="danger" onSelect={handleRemove}>
            Remove relationship
          </ActionList.Item>
        </ActionList>
      </AnchoredOverlay>
    );
  };

  const handleOpenWithType = (type: RelationshipType) => {
    setSelectedType(type);
    setSearchQuery('');
    setIsAddingRelationship(true);
  };

  const renderSectionHeading = (label: string, type: RelationshipType) => (
    <div
      onClick={() => handleOpenWithType(type)}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--control-bgColor-hover)'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--fgColor-muted)',
        marginTop: '8px',
        padding: '2px 12px',
        minHeight: '32px',
        cursor: 'pointer',
        borderRadius: '6px',
        transition: 'background-color 0.15s ease',
      }}
    >
      {label}
    </div>
  );

  const toggleGroupExpansion = (type: RelationshipType) => {
    setExpandedGroups(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const renderRelationshipGroup = (ids: string[], type: RelationshipType) => {
    const MAX_VISIBLE = 3;
    const isExpanded = expandedGroups[type] || false;
    const visibleIds = isExpanded ? ids : ids.slice(0, MAX_VISIBLE);
    const hiddenCount = ids.length - MAX_VISIBLE;

    if (hiddenCount <= 0) {
      return ids.map(id => renderRelationshipItem(id, type));
    }

    const hiddenIds = ids.slice(MAX_VISIBLE);
    const previewIds = hiddenIds.slice(0, 3);
    const remainingCount = hiddenIds.length - previewIds.length;

    const getPreviewText = () => {
      const previewNumbers = previewIds.map(id => {
        const issue = getIssueById(id);
        return issue ? `#${issue.number}` : '';
      }).filter(Boolean);
      
      if (remainingCount > 0) {
        return `${previewNumbers.join(', ')} + ${remainingCount} other${remainingCount > 1 ? 's' : ''}`;
      }
      return previewNumbers.join(', ');
    };

    return (
      <>
        {visibleIds.map(id => renderRelationshipItem(id, type))}
        {!isExpanded && hiddenCount > 0 && (
          <Button
            variant="invisible"
            size="small"
            onClick={() => toggleGroupExpansion(type)}
            leadingVisual={() => <Plus size={16} />}
            sx={{
              fontSize: '12px',
              fontWeight: 'normal',
              padding: '4px 12px',
              justifyContent: 'flex-start',
              width: '100%',
            }}
          >
            {hiddenCount} more ({getPreviewText()})
          </Button>
        )}
      </>
    );
  };

  const renderTypeSelector = () => (
    <div style={{ width: '296px' }}>
      <ActionList>
        <ActionList.Item
          onSelect={() => {
            setSelectedType('parent');
            setSearchQuery('');
          }}
        >
          {relationships.parent ? 'Change parent issue' : 'Parent issue'}
        </ActionList.Item>
        <ActionList.Item
          onSelect={() => {
            setSelectedType('blocked-by');
            setSearchQuery('');
          }}
        >
        
          Blocked by
        </ActionList.Item>
        <ActionList.Item
          onSelect={() => {
            setSelectedType('blocking');
            setSearchQuery('');
          }}
        >
          Blocking
        </ActionList.Item>
      </ActionList>
    </div>
  );

  const getHeaderText = (type: RelationshipType): string => {
    switch (type) {
      case 'parent':
        return relationships.parent ? 'Change parent issue' : 'Add parent issue';
      case 'blocked-by':
        return 'Add issues that are blocking this issue';
      case 'blocking':
        return 'Add issues this issue is blocking';
      default:
        return '';
    }
  };

  const renderIssueSelector = () => {
    const filteredIssues = getFilteredIssuesForType(selectedType!);
    const selectionVariant = selectedType === 'parent' ? 'single' : 'multiple';
    
    return (
      <div style={{ width: '296px', maxHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px', borderBottom: '1px solid var(--borderColor-default)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setSelectedType(null)}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: 'var(--fgColor-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--control-bgColor-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fgColor-default)' }}>
            {getHeaderText(selectedType!)}
          </span>
        </div>
        <div style={{ padding: '8px' }}>
          <TextInput
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            block
          />
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <ActionList selectionVariant={selectionVariant}>
            {filteredIssues.map((availableIssue) => {
              const isSelected = isIssueSelected(availableIssue.id, selectedType!);
              return (
                <ActionList.Item
                  key={availableIssue.id}
                  selected={isSelected}
                  role={selectionVariant === 'single' ? 'menuitemradio' : 'menuitemcheckbox'}
                  aria-checked={isSelected}
                  onSelect={() => handleToggleRelationship(availableIssue.id, selectedType!)}
                >
                  <ActionList.LeadingVisual>
                    <span style={{ color: availableIssue.state === 'open' ? 'var(--color-open-fg, #1a7f37)' : 'var(--color-closed-fg, #8250df)' }}>
                      {availableIssue.state === 'open' ? (
                        <IssueOpenedIcon size={16} />
                      ) : (
                        <IssueClosedIcon size={16} />
                      )}
                    </span>
                  </ActionList.LeadingVisual>
                  <span style={{ 
                    color: 'var(--fgColor-muted)',
                    marginRight: '4px',
                  }}>
                    #{availableIssue.number}
                  </span>
                  {availableIssue.title}
                </ActionList.Item>
              );
            })}
            {filteredIssues.length === 0 && (
              <ActionList.Item disabled>
                No matching issues
              </ActionList.Item>
            )}
          </ActionList>
        </div>
      </div>
    );
  };

  return (
    <div>
      <AnchoredOverlay
        open={isAddingRelationship}
        onOpen={() => setIsAddingRelationship(true)}
        onClose={() => {
          setIsAddingRelationship(false);
          setSelectedType(null);
          setSearchQuery('');
        }}
        renderAnchor={(anchorProps) => (
          <SidebarLabel
            {...anchorProps}
            showPlusIcon={true}
            onClick={() => setIsAddingRelationship(!isAddingRelationship)}
            isActive={isAddingRelationship}
          >
            Relationships
          </SidebarLabel>
        )}
        side="outside-bottom"
        align="start"
      >
        {selectedType ? renderIssueSelector() : renderTypeSelector()}
      </AnchoredOverlay>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!hasRelationships ? (
          <div style={{ padding: '0', color: 'var(--fgColor-muted)', fontSize: '12px' }}>
            No relationships
          </div>
        ) : (
          <>
            {relationships.parent && (
              <>
                {renderSectionHeading('Parent', 'parent')}
                {renderRelationshipItem(relationships.parent, 'parent')}
              </>
            )}
            {relationships.blockedBy.length > 0 && (
              <>
                {renderSectionHeading('Blocked by', 'blocked-by')}
                {renderRelationshipGroup(relationships.blockedBy, 'blocked-by')}
              </>
            )}
            {relationships.blocking.length > 0 && (
              <>
                {renderSectionHeading('Blocking', 'blocking')}
                {renderRelationshipGroup(relationships.blocking, 'blocking')}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
