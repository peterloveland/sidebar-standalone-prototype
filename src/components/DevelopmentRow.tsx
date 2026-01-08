import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ActionList, AnchoredOverlay, TextInput } from '@primer/react';
import { GitBranchIcon, GitPullRequestIcon } from '@primer/octicons-react';
import { SidebarLabel } from './SidebarLabel';
import styles from './Project.module.css';

interface DevelopmentRowProps {
  issueId: string;
}

type DevelopmentItemType = 'branch' | 'pull-request';

interface DevelopmentItem {
  id: string;
  type: DevelopmentItemType;
  name: string;
  repo?: string;
  status?: 'open' | 'merged' | 'closed' | 'draft';
}

// Sample linked development items
const LINKED_ITEMS: DevelopmentItem[] = [
  { id: 'dev-1', type: 'branch', name: 'feature/auth-flow', repo: 'acme/frontend' },
  { id: 'dev-2', type: 'pull-request', name: 'Add user authentication', status: 'open' },
  { id: 'dev-3', type: 'pull-request', name: 'Fix login redirect', status: 'merged', repo: 'acme/api' },
  { id: 'dev-4', type: 'branch', name: 'bugfix/session-timeout' },
];

// Available items to link
const AVAILABLE_ITEMS: DevelopmentItem[] = [
  { id: 'avail-1', type: 'branch', name: 'main' },
  { id: 'avail-2', type: 'branch', name: 'develop' },
  { id: 'avail-3', type: 'branch', name: 'feature/new-dashboard', repo: 'acme/frontend' },
  { id: 'avail-4', type: 'pull-request', name: 'Implement dark mode', status: 'open' },
  { id: 'avail-5', type: 'pull-request', name: 'Refactor API endpoints', status: 'draft', repo: 'acme/api' },
  { id: 'avail-6', type: 'branch', name: 'feature/notifications', repo: 'acme/notifications' },
  { id: 'avail-7', type: 'pull-request', name: 'Add unit tests', status: 'open' },
  { id: 'avail-8', type: 'pull-request', name: 'Update dependencies', status: 'merged' },
];

const STORAGE_KEY_PREFIX = 'issue-development-';

function getLinkedItems(issueId: string): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + issueId);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading development items:', error);
  }
  // Return default linked items for demo
  return LINKED_ITEMS.map(item => item.id);
}

function saveLinkedItems(issueId: string, items: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + issueId, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving development items:', error);
  }
}

function getItemById(id: string): DevelopmentItem | undefined {
  return [...LINKED_ITEMS, ...AVAILABLE_ITEMS].find(item => item.id === id);
}

function getPRStatusColor(status?: string): string {
  switch (status) {
    case 'open':
      return 'var(--color-open-fg, #1a7f37)';
    case 'merged':
      return 'var(--color-done-fg, #8250df)';
    case 'closed':
      return 'var(--color-closed-fg, #cf222e)';
    case 'draft':
      return 'var(--fgColor-muted)';
    default:
      return 'var(--fgColor-muted)';
  }
}

export function DevelopmentRow({ issueId }: DevelopmentRowProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkedItemIds, setLinkedItemIds] = useState<string[]>(() => getLinkedItems(issueId));
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleToggleItem = (itemId: string) => {
    let newItems: string[];
    if (linkedItemIds.includes(itemId)) {
      newItems = linkedItemIds.filter(id => id !== itemId);
    } else {
      newItems = [...linkedItemIds, itemId];
    }
    setLinkedItemIds(newItems);
    saveLinkedItems(issueId, newItems);
    window.dispatchEvent(new Event('storage'));
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = linkedItemIds.filter(id => id !== itemId);
    setLinkedItemIds(newItems);
    saveLinkedItems(issueId, newItems);
    window.dispatchEvent(new Event('storage'));
    setOpenMenuId(null);
  };

  const getFilteredItems = () => {
    const allItems = [...LINKED_ITEMS, ...AVAILABLE_ITEMS];
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex(i => i.id === item.id)
    );
    
    return uniqueItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.repo && item.repo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const linkedItems = linkedItemIds
    .map(id => getItemById(id))
    .filter((item): item is DevelopmentItem => item !== undefined);

  const renderDevelopmentItem = (item: DevelopmentItem) => {
    const menuId = item.id;
    const isMenuOpen = openMenuId === menuId;
    const isBranch = item.type === 'branch';

    const handleOpenItem = () => {
      // In a real app, this would navigate to the branch/PR
      window.open(isBranch ? `/branches/${item.name}` : `/pull/${item.id}`, '_blank');
      setOpenMenuId(null);
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
              <div className={styles.icon} style={{ color: isBranch ? 'var(--fgColor-muted)' : getPRStatusColor(item.status) }}>
                {isBranch ? (
                  <GitBranchIcon size={16} />
                ) : (
                  <GitPullRequestIcon size={16} />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span className={styles.title}>
                  {item.name} <span style={{ fontWeight: 'normal', color: 'var(--fgColor-muted)' }}>#{item.id.replace(/\D/g, '')}</span>
                </span>
                {item.repo && (
                  <span style={{ fontSize: '12px', color: 'var(--fgColor-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.repo}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        side="outside-bottom"
        align="start"
      >
        <ActionList>
          <ActionList.Item onSelect={handleOpenItem}>
            <ActionList.TrailingVisual>
              <ArrowUpRight size={16} />
            </ActionList.TrailingVisual>
            Open {isBranch ? 'branch' : 'pull request'}
          </ActionList.Item>
          <ActionList.Divider />
          <ActionList.Item variant="danger" onSelect={() => handleRemoveItem(item.id)}>
            Remove link
          </ActionList.Item>
        </ActionList>
      </AnchoredOverlay>
    );
  };

  const renderItemSelector = () => {
    const filteredItems = getFilteredItems();
    
    return (
      <div style={{ width: '296px', maxHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px' }}>
          <TextInput
            placeholder="Search branches and pull requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            block
          />
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <ActionList selectionVariant="multiple">
            {filteredItems.map((item) => {
              const isSelected = linkedItemIds.includes(item.id);
              const isBranch = item.type === 'branch';
              return (
                <ActionList.Item
                  key={item.id}
                  selected={isSelected}
                  role="menuitemcheckbox"
                  aria-checked={isSelected}
                  onSelect={() => handleToggleItem(item.id)}
                >
                  <ActionList.LeadingVisual>
                    <span style={{ color: isBranch ? 'var(--fgColor-muted)' : getPRStatusColor(item.status) }}>
                      {isBranch ? (
                        <GitBranchIcon size={16} />
                      ) : (
                        <GitPullRequestIcon size={16} />
                      )}
                    </span>
                  </ActionList.LeadingVisual>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{item.name}</span>
                    {item.repo && (
                      <span style={{ fontSize: '11px', color: 'var(--fgColor-muted)' }}>
                        {item.repo}
                      </span>
                    )}
                  </div>
                </ActionList.Item>
              );
            })}
            {filteredItems.length === 0 && (
              <ActionList.Item disabled>
                No matching items
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
        open={isAddingItem}
        onOpen={() => setIsAddingItem(true)}
        onClose={() => {
          setIsAddingItem(false);
          setSearchQuery('');
        }}
        renderAnchor={(anchorProps) => (
          <SidebarLabel
            {...anchorProps}
            showPlusIcon={true}
            onClick={() => setIsAddingItem(!isAddingItem)}
            isActive={isAddingItem}
          >
            Development
          </SidebarLabel>
        )}
        side="outside-bottom"
        align="start"
      >
        {renderItemSelector()}
      </AnchoredOverlay>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {linkedItems.length === 0 ? (
          <div style={{ padding: '0', color: 'var(--fgColor-muted)', fontSize: '12px' }}>
            No branches or pull requests
          </div>
        ) : (
          linkedItems.map(item => renderDevelopmentItem(item))
        )}
      </div>
    </div>
  );
}
