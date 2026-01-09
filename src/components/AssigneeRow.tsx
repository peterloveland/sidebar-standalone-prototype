import { useState, useRef, useEffect, useCallback } from 'react';
import { User, X, Settings } from 'lucide-react';
import { PlusIcon } from '@primer/octicons-react';
import { ActionList, Avatar, CounterLabel, Button } from '@primer/react';
import { IconButton } from './ui/IconButton';
import { SidebarRow } from './SidebarRow';
import { CreateAgentSessionDialog } from './CreateAgentSessionDialog';
import { AgentSessionProgressCard } from './AgentSessionProgressCard';
import { db } from '../lib/db';
import { AGENTS, getAgentByName } from '../lib/agents';
import styles from './IssueSidebar.module.css';

interface AssigneeRowProps {
  issueId: string;
}

// Sample list of available assignees
const AVAILABLE_ASSIGNEES = [
  { username: 'johndoe', avatar: 'https://github.com/johndoe.png' },
  { username: 'janedoe', avatar: 'https://github.com/janedoe.png' },
  { username: 'alice', avatar: 'https://github.com/alice.png' },
  { username: 'bob', avatar: 'https://github.com/bob.png' },
  { username: 'charlie', avatar: 'https://github.com/charlie.png' },
  { username: 'peterloveland', avatar: 'https://github.com/peterloveland.png' },
  { username: 'laurmo', avatar: 'https://github.com/laurmo.png' },
  { username: 'labudis', avatar: 'https://github.com/labudis.png' },
];


export function AssigneeRow({ issueId }: AssigneeRowProps) {
  const [clickedAssignee, setClickedAssignee] = useState<string | null>(null);
  const [localAssignees, setLocalAssignees] = useState<string[]>([]);
  const [hoverCardPosition, setHoverCardPosition] = useState({ top: 0, left: 0 });
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] = useState(false);
  const [preselectedAgent, setPreselectedAgent] = useState<string | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [pendingUnassignAgent, setPendingUnassignAgent] = useState<{ 
    name: string; 
    sessionCount: number;
    sessions: Array<{ id: string; instructions: string; repo: string; branch: string; status: 'running' | 'completed' | 'failed'; createdAt: number; progress: number }>;
    includesBaseSession: boolean;
  } | null>(null);
  const [pendingLocalAssignees, setPendingLocalAssignees] = useState<string[] | null>(null);
  const chipRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const prevAssigneesRef = useRef<string[]>([]);
  const newAssigneeIndicesRef = useRef<Map<string, number>>(new Map());
  const issue = db.getById(issueId);

  useEffect(() => {
    if (clickedAssignee && chipRefs.current[clickedAssignee]) {
      const rect = chipRefs.current[clickedAssignee]!.getBoundingClientRect();
      setHoverCardPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [clickedAssignee]);

  if (!issue) {
    return null;
  }

  // Combine assignees and agents for editing
  const assigneesValue = [...(issue.assignees || []), ...(issue.agents || [])];

  const handleCloseCreateSessionDialog = useCallback(() => {
    setIsCreateSessionDialogOpen(false);
    setPreselectedAgent(null);
  }, []);

  const handleSubmitCustomSession = (data: { instructions: string; repo: string; branch: string; agent: string }) => {
    // Save custom session to localStorage
    const existingSessions = getCustomSessions();
    const newSession = {
      id: `session-${Date.now()}`,
      instructions: data.instructions,
      repo: data.repo,
      branch: data.branch,
      agent: data.agent,
      createdAt: Date.now(),
      status: 'running' as const,
      progress: Math.floor(Math.random() * 50) + 10,
    };
    const updatedSessions = [...existingSessions, newSession];
    try {
      localStorage.setItem(`issue-custom-sessions-${issueId}`, JSON.stringify(updatedSessions));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error saving custom session:', error);
    }
  };

  const handleEditingChange = (isEditing: boolean) => {
    if (isEditing) {
      // When opening, set local state to current value
      setLocalAssignees(assigneesValue);
    } else {
      // When closing, check if any agents with sessions are being unassigned
      if (JSON.stringify(localAssignees) !== JSON.stringify(assigneesValue)) {
        // Find agents being removed
        const currentAgents = assigneesValue.filter(a => AGENTS.some(agent => agent.name === a));
        const newAgents = localAssignees.filter(a => AGENTS.some(agent => agent.name === a));
        const removedAgents = currentAgents.filter(a => !newAgents.includes(a));
        
        // Check if any removed agent has sessions
        for (const agentName of removedAgents) {
          const sessionCount = getAgentSessionCount(agentName);
          if (sessionCount > 0) {
            // Get the actual sessions for this agent
            const allCustomSessions = getCustomSessions();
            const agentSessions = allCustomSessions.filter(
              (s: { agent: string; status: string }) => s.agent === agentName && s.status === 'running'
            );
            const includesBaseSession = (issue?.agents || []).includes(agentName);
            
            // Show confirmation dialog
            setPendingUnassignAgent({ 
              name: agentName, 
              sessionCount,
              sessions: agentSessions,
              includesBaseSession,
            });
            setPendingLocalAssignees(localAssignees);
            return; // Don't save yet, wait for confirmation
          }
        }
        
        // No agents with sessions being removed, save normally
        const humanAssignees = localAssignees.filter(a => !AGENTS.some(agent => agent.name === a));
        const agentAssignees = localAssignees.filter(a => AGENTS.some(agent => agent.name === a));
        db.update(issueId, { assignees: humanAssignees, agents: agentAssignees });
        window.dispatchEvent(new Event('storage'));
      }
    }
  };

  const handleConfirmUnassign = () => {
    if (!pendingUnassignAgent || !pendingLocalAssignees) return;
    
    // Remove all sessions for this agent
    const customSessions = getCustomSessions();
    const filteredSessions = customSessions.filter(
      (s: { agent: string }) => s.agent !== pendingUnassignAgent.name
    );
    try {
      localStorage.setItem(`issue-custom-sessions-${issueId}`, JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Error removing sessions:', error);
    }
    
    // Save the assignee changes
    const humanAssignees = pendingLocalAssignees.filter(a => !AGENTS.some(agent => agent.name === a));
    const agentAssignees = pendingLocalAssignees.filter(a => AGENTS.some(agent => agent.name === a));
    db.update(issueId, { assignees: humanAssignees, agents: agentAssignees });
    window.dispatchEvent(new Event('storage'));
    
    // Clear pending state
    setPendingUnassignAgent(null);
    setPendingLocalAssignees(null);
  };

  const handleCancelUnassign = () => {
    // Revert local assignees back to original and clear pending state
    setLocalAssignees(assigneesValue);
    setPendingUnassignAgent(null);
    setPendingLocalAssignees(null);
  };

  const toggleAssignee = (assignee: string) => {
    const isAgent = AGENTS.some(agent => agent.name === assignee);
    let newAssignees = localAssignees.includes(assignee)
      ? localAssignees.filter(a => a !== assignee)
      : [...localAssignees, assignee];
    
    // If assigning an agent and peterloveland isn't assigned, add them
    if (isAgent && !localAssignees.includes(assignee) && !newAssignees.includes('peterloveland')) {
      newAssignees = [...newAssignees, 'peterloveland'];
    }
    
    setLocalAssignees(newAssignees);
  };

  const removeAssignee = (assignee: string) => {
    // Directly update the database
    const currentAssignees = [...(issue.assignees || []), ...(issue.agents || [])];
    const newAssignees = currentAssignees.filter(a => a !== assignee);
    
    // Separate assignees and agents
    const humanAssignees = newAssignees.filter(a => !AGENTS.some(agent => agent.name === a));
    const agentAssignees = newAssignees.filter(a => AGENTS.some(agent => agent.name === a));
    
    db.update(issueId, { assignees: humanAssignees, agents: agentAssignees });
    window.dispatchEvent(new Event('storage'));
    setClickedAssignee(null);
  };

  const isAssigned = (assignee: string) => {
    return localAssignees.includes(assignee);
  };

  // Render display function
  const renderDisplay = (assignees: string[], _onChange: (val: string[]) => void, _openEditor: () => void) => {
    // Only show human assignees in the display (agents shown separately)
    const humanOnly = assigneesValue.filter(a => !AGENTS.some(agent => agent.name === a));
    const hasAgents = assigneesValue.some(a => AGENTS.some(agent => agent.name === a));
    
    if (assigneesValue.length === 0) {
      return null;
    }

    // If we have agents but no human assignees
    if (hasAgents && humanOnly.length === 0) {
      return (
        <span className={styles.emptyState}>
          No user is assigned
        </span>
      );
    }

    // Find newly added assignees and assign them indices
    const newAssignees = humanOnly.filter(assignee => !prevAssigneesRef.current.includes(assignee));
    
    // Assign indices to new assignees
    newAssignees.forEach((assignee, index) => {
      if (!newAssigneeIndicesRef.current.has(assignee)) {
        newAssigneeIndicesRef.current.set(assignee, index);
      }
    });
    
    // Clean up indices for removed assignees
    prevAssigneesRef.current.forEach(assignee => {
      if (!humanOnly.includes(assignee)) {
        newAssigneeIndicesRef.current.delete(assignee);
      }
    });
    
    prevAssigneesRef.current = humanOnly;

    return (
      <div className={styles.multipleListContainer}>
        {humanOnly.map((assignee) => {
          const userInfo = AVAILABLE_ASSIGNEES.find(
            (u) => u.username === assignee
          );
          const newAssigneeIndex = newAssigneeIndicesRef.current.get(assignee);
          const hasDelay = newAssigneeIndex !== undefined;
          
          return (
            <div
              key={assignee}
              ref={(el) => (chipRefs.current[assignee] = el)}
              className={styles.assigneeChip}
              onClick={(e) => {
                e.stopPropagation();
                setClickedAssignee(
                  clickedAssignee === assignee ? null : assignee
                );
              }}
              style={{ 
                cursor: "pointer", 
                position: "relative",
                transitionDelay: hasDelay ? `${newAssigneeIndex * 0.05}s` : '0s'
              }}
            >
              <div className={styles.assigneeChipInner}>
                {userInfo ? (
                  <Avatar
                    src={userInfo.avatar}
                    alt={assignee}
                    className={styles.assigneeAvatar}
                    size={16}
                  />
                ) : (
                  <div className={styles.assigneeAvatar}>
                    <User className={styles.assigneeAvatarIcon} />
                  </div>
                )}
                <span className={styles.assigneeName}>{assignee}</span>
              </div>

              {clickedAssignee === assignee && (
                <>
                  <div
                    className={styles.hoverBackdrop}
                    onClick={(e) => {
                      e.stopPropagation();
                      setClickedAssignee(null);
                    }}
                  />
                  <div
                    className={styles.hoverCard}
                    style={{
                      top: `${hoverCardPosition.top}px`,
                      left: `${hoverCardPosition.left}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.hoverCardHeader}>
                      {userInfo ? (
                        <img
                          src={userInfo.avatar}
                          alt={assignee}
                          className={styles.hoverCardAvatar}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className={styles.hoverCardAvatar}>
                          <User className={styles.hoverCardAvatarIcon} />
                        </div>
                      )}
                      <div className={styles.hoverCardInfo}>
                        <div className={styles.hoverCardName}>{assignee}</div>
                        <div className={styles.hoverCardRole}>Assignee</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAssignee(assignee);
                      }}
                      className={styles.removeButton}
                    >
                      Remove assignee
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Get custom sessions from localStorage to count active sessions per agent
  const getCustomSessions = () => {
    try {
      const data = localStorage.getItem(`issue-custom-sessions-${issueId}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading custom sessions:', error);
    }
    return [];
  };

  // Count sessions for a specific agent
  const getAgentSessionCount = (agentName: string) => {
    const customSessions = getCustomSessions();
    const customSessionCount = customSessions.filter(
      (s: { agent: string; status: string }) => s.agent === agentName && s.status === 'running'
    ).length;
    // Also count if this agent is assigned to the issue (represents an active session)
    const isAssignedToIssue = (issue?.agents || []).includes(agentName) ? 1 : 0;
    return customSessionCount + isAssignedToIssue;
  };

  // Render editor function
  const renderEditor = (assignees: string[], _onChange: (val: string[]) => void, closeEditor: () => void) => {
    // Use assigneesValue (initial state) for grouping, not localAssignees
    // This prevents items from moving until the dialog closes
    const selectedAgents = AGENTS.filter(agent => assigneesValue.includes(agent.name));
    const selectedUsers = AVAILABLE_ASSIGNEES.filter(user => assigneesValue.includes(user.username));
    const unselectedAgents = AGENTS.filter(agent => !assigneesValue.includes(agent.name));
    const unselectedUsers = AVAILABLE_ASSIGNEES.filter(user => !assigneesValue.includes(user.username));

    const handleOpenCreateSession = (agentId?: string) => {
      closeEditor();
      setPreselectedAgent(agentId || null);
      setIsCreateSessionDialogOpen(true);
    };
    
    return (
      <div style={{ width: "296px" }}>
        {/* Selected items at the top */}
        {(selectedUsers.length > 0 || selectedAgents.length > 0) && (
          <ActionList selectionVariant="multiple">
            {selectedUsers.map((user) => (
              <ActionList.Item
                key={user.username}
                onSelect={() => toggleAssignee(user.username)}
                role="menuitemradio"
                selected={isAssigned(user.username)}
                aria-checked={isAssigned(user.username)}
              >
                <ActionList.LeadingVisual>
                  <img
                    src={user.avatar}
                    alt={user.username}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                    }}
                  />
                </ActionList.LeadingVisual>
                {user.username}
              </ActionList.Item>
            ))}
            {selectedAgents.map((agent) => {
              const sessionCount = getAgentSessionCount(agent.name);
              const isHovered = hoveredAgent === agent.name;
              return (
                <div
                  key={agent.name}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setHoveredAgent(agent.name)}
                  onMouseLeave={() => setHoveredAgent(null)}
                >
                  <ActionList.Item
                    role="menuitemradio"
                    selected={isAssigned(agent.name)}
                    aria-checked={isAssigned(agent.name)}
                    onSelect={() => toggleAssignee(agent.name)}
                  >
                    <ActionList.LeadingVisual>
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                        }}
                      />
                    </ActionList.LeadingVisual>
                    {agent.name}
                    {sessionCount > 0 && (
                      <ActionList.TrailingVisual>
                        <CounterLabel>{sessionCount}</CounterLabel>
                      </ActionList.TrailingVisual>
                    )}
                  </ActionList.Item>
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        backgroundColor: 'var(--control-bgColor-hover, #f6f8fa)',
                        borderRadius: 'var(--borderRadius-medium, 6px)',
                      }}
                    >
                      <IconButton
                        icon={PlusIcon}
                        variant="invisible"
                        size="small"
                        aria-label="Start custom session"
                        tooltip="Start custom session"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreateSession(agent.name);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </ActionList>
        )}

        {/* Unselected agents */}
        <ActionList selectionVariant="multiple">
          <div className={styles.agentGroup}>
            <ActionList.GroupHeading as="h3">Agents</ActionList.GroupHeading>
            <div
              className={styles.customAgentCTA}
              onClick={handleOpenCreateSession}
              style={{ cursor: "pointer" }}
            >
              Create new
            </div>
          </div>
          {unselectedAgents.length > 0 ? (
            unselectedAgents.map((agent) => {
              const sessionCount = getAgentSessionCount(agent.name);
              const isHovered = hoveredAgent === agent.name;
              return (
                <div
                  key={agent.name}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setHoveredAgent(agent.name)}
                  onMouseLeave={() => setHoveredAgent(null)}
                >
                  <ActionList.Item
                    selected={isAssigned(agent.name)}
                    role="menuitemradio"
                    aria-checked={isAssigned(agent.name)}
                    onSelect={() => toggleAssignee(agent.name)}
                  >
                    <ActionList.LeadingVisual>
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                        }}
                      />
                    </ActionList.LeadingVisual>
                    {agent.name}
                    {sessionCount > 0 && (
                      <ActionList.TrailingVisual>
                        <CounterLabel>{sessionCount}</CounterLabel>
                      </ActionList.TrailingVisual>
                    )}
                  </ActionList.Item>
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        backgroundColor: 'var(--control-bgColor-hover, #f6f8fa)',
                        borderRadius: 'var(--borderRadius-medium, 6px)',
                      }}
                    >
                      <IconButton
                        icon={PlusIcon}
                        variant="invisible"
                        size="small"
                        aria-label="Start custom session"
                        tooltip="Start custom session"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreateSession(agent.name);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                color: "var(--fgColor-muted, #656d76)",
                cursor: "pointer",
              }}
              onClick={handleOpenCreateSession}
            >
              All agents already assigned. Create a new custom session
            </div>
          )}

          <ActionList.GroupHeading as="h3">Users</ActionList.GroupHeading>
          {unselectedUsers.map((user) => (
            <ActionList.Item
              key={user.username}
              onSelect={() => toggleAssignee(user.username)}
              role="menuitemradio"
              selected={isAssigned(user.username)}
              aria-checked={isAssigned(user.username)}
            >
              <ActionList.LeadingVisual>
                <img
                  src={user.avatar}
                  alt={user.username}
                  style={{ width: "20px", height: "20px", borderRadius: "50%" }}
                />
              </ActionList.LeadingVisual>
              {user.username}
            </ActionList.Item>
          ))}
        </ActionList>
      </div>
    );
  };

  const humanAssignees = assigneesValue.filter(a => !AGENTS.some(agent => agent.name === a));
  const footerContent = assigneesValue.length === 0 ? (
    <div className={styles.quickActions}>
      {/* show assign copilot */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Directly update the database
          const humanAssignees = [...(issue.assignees || []), 'peterloveland'];
          const agentAssignees = [...(issue.agents || []), 'copilot'];
          db.update(issueId, { assignees: humanAssignees, agents: agentAssignees });
          window.dispatchEvent(new Event('storage'));
        }}
        className={styles.quickActionButton}
      >
        Assign Copilot
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Directly update the database
          const humanAssignees = [...(issue.assignees || []), 'peterloveland'];
          db.update(issueId, { assignees: humanAssignees });
          window.dispatchEvent(new Event('storage'));
        }}
        className={styles.quickActionButton}
      >
        Assign yourself
      </button>
    </div>
  ) : undefined;

  return (
    <>
      <SidebarRow
        label="Assignees"
        value={assigneesValue}
        type="multi-select"
        renderDisplay={renderDisplay}
        renderEditor={renderEditor}
        onChange={(newAssignees) => {
          setLocalAssignees(newAssignees);
        }}
        onEditingChange={handleEditingChange}
        footer={footerContent}
        // disableClickToEdit={true}
      />
      <CreateAgentSessionDialog
        isOpen={isCreateSessionDialogOpen}
        onClose={handleCloseCreateSessionDialog}
        onSubmit={handleSubmitCustomSession}
        defaultAgent={preselectedAgent || undefined}
      />
      {pendingUnassignAgent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleCancelUnassign}
        >
          <div
            style={{
              backgroundColor: 'var(--bgColor-default, #ffffff)',
              borderRadius: 'var(--borderRadius-large, 12px)',
              padding: 'var(--base-size-24, 1.5rem)',
              maxWidth: '400px',
              boxShadow: 'var(--shadow-floating-large, 0 12px 28px rgba(0, 0, 0, 0.15))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 var(--base-size-12, 0.75rem) 0',
                fontSize: 'var(--text-title-size-medium, 1.25rem)',
                fontWeight: 'var(--base-text-weight-semibold, 600)',
              }}
            >
              Stop agent sessions?
            </h3>
            <p
              style={{
                margin: '0 0 var(--base-size-16, 1rem) 0',
                fontSize: 'var(--text-body-size-medium, 0.875rem)',
                color: 'var(--fgColor-muted, #656d76)',
              }}
            >
              Unassigning <strong>{pendingUnassignAgent.name}</strong> will stop{' '}
              <strong>{pendingUnassignAgent.sessionCount}</strong> active session
              {pendingUnassignAgent.sessionCount !== 1 ? 's' : ''}:
            </p>
            <div
              style={{
                marginBottom: 'var(--base-size-16, 1rem)',
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--base-size-8, 0.5rem)',
              }}
            >
              {pendingUnassignAgent.includesBaseSession && (
                <AgentSessionProgressCard
                  title={issue?.title || 'Assigned session'}
                  subtitle={`${pendingUnassignAgent.name.charAt(0).toUpperCase() + pendingUnassignAgent.name.slice(1)} • Active`}
                  description="Working on assigned issue"
                  progress={50}
                  status="running"
                  avatar={getAgentByName(pendingUnassignAgent.name)?.avatar}
                />
              )}
              {pendingUnassignAgent.sessions.map((session) => {
                const agentInfo = getAgentByName(pendingUnassignAgent.name);
                return (
                  <AgentSessionProgressCard
                    key={session.id}
                    title={`${session.repo} / ${session.branch}`}
                    subtitle={`${pendingUnassignAgent.name.charAt(0).toUpperCase() + pendingUnassignAgent.name.slice(1)} • ${Math.floor((Date.now() - session.createdAt) / 1000)}s`}
                    description={session.instructions || 'No instructions'}
                    progress={session.progress}
                    status={session.status}
                    avatar={agentInfo?.avatar}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 'var(--base-size-8, 0.5rem)', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancelUnassign}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmUnassign}>
                Stop sessions & unassign
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
