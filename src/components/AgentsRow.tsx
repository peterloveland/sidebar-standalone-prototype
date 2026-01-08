import { useState, useRef, useEffect } from 'react';
import { AgentIcon, PlusIcon } from '@primer/octicons-react';
import { Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Avatar, AvatarStack, IconButton } from '@primer/react';
import { db } from '../lib/db';
import { CreateAgentSessionDialog } from './CreateAgentSessionDialog';
import styles from './IssueSidebar.module.css';

interface AgentsRowProps {
  issueId: string;
}

interface CustomSession {
  id: string;
  instructions: string;
  repo: string;
  branch: string;
  agent: string;
  createdAt: number;
  status: 'running' | 'completed' | 'failed';
  progress: number;
}

const AGENTS = [
  {
    name: "copilot",
    avatar:
      "https://external-preview.redd.it/github-copilot-with-microsoft-visual-studio-v0-6tu2QwvAliANk-cC4Is_8PFPrwxeHeFj_e-fBW9JbCo.jpg?auto=webp&s=e97e278492dd12ee674e710b4931580f4fb66351",
  },
  {
    name: "claude",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtUnGYPe67wuzVDjTujZ21UV38Y6KQ290fow&s",
  },
  {
    name: "codex",
    avatar: "https://github.com/openai.png",
  },
];

const CUSTOM_SESSIONS_KEY_PREFIX = 'issue-custom-sessions-';

function getCustomSessions(issueId: string): CustomSession[] {
  try {
    const data = localStorage.getItem(CUSTOM_SESSIONS_KEY_PREFIX + issueId);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading custom sessions:', error);
  }
  return [];
}

function saveCustomSessions(issueId: string, sessions: CustomSession[]): void {
  try {
    localStorage.setItem(CUSTOM_SESSIONS_KEY_PREFIX + issueId, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving custom sessions:', error);
  }
}

export function AgentsRow({ issueId }: AgentsRowProps) {
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] = useState(false);
  const [customSessions, setCustomSessions] = useState<CustomSession[]>(() => getCustomSessions(issueId));
  const sessionsRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const issue = db.getById(issueId);

  // Trigger animation on mount only once
  useEffect(() => {
    if (!hasAnimatedRef.current) {
      setShouldAnimate(true);
      hasAnimatedRef.current = true;
    }
  }, []);

  // Listen for storage changes to refresh custom sessions
  useEffect(() => {
    const handleStorageChange = () => {
      setCustomSessions(getCustomSessions(issueId));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [issueId]);

  if (!issue) {
    return null;
  }

  const agentsValue = issue.agents || [];

  const handleCreateCustomSession = () => {
    setIsCreateSessionDialogOpen(true);
  };

  const handleSubmitCustomSession = (data: { instructions: string; repo: string; branch: string; agent: string }) => {
    const newSession: CustomSession = {
      id: `session-${Date.now()}`,
      instructions: data.instructions,
      repo: data.repo,
      branch: data.branch,
      agent: data.agent,
      createdAt: Date.now(),
      status: 'running',
      progress: Math.floor(Math.random() * 50) + 10, // Random progress 10-60%
    };
    
    const updatedSessions = [...customSessions, newSession];
    setCustomSessions(updatedSessions);
    saveCustomSessions(issueId, updatedSessions);
    window.dispatchEvent(new Event('storage'));
  };

  // Total session count = issue agents + custom sessions
  const totalSessionCount = agentsValue.length + customSessions.length;

  if (totalSessionCount === 0) {
    return null;
  }

  // Get agent info with avatars for issue agents
  const agentDetails = agentsValue.map(agentName => 
    AGENTS.find(a => a.name === agentName)
  ).filter(Boolean);

  // Get avatars for custom sessions
  const customSessionAvatars = customSessions.map(session => 
    AGENTS.find(a => a.name === session.agent)
  ).filter(Boolean);

  return (
    <>
      <div className={styles.agentsRowContainer}>
        <svg
          className={styles.agentConnector}
          width="24"
          height="32"
          viewBox="0 0 24 32"
          style={{
            flexShrink: 0,
            marginTop: "var(--base-size-4, 0.25rem)",
            overflow: "visible",
          }}
        >
          <path
            d="M1 0V12C1 14.2091 2.79086 16 5 16H24"
            fill="none"
            stroke="var(--borderColor-muted, #d0d7de)"
            strokeWidth="2"
            className={shouldAnimate ? styles.animateStroke : ""}
          />
        </svg>
        <div
          ref={sessionsRef}
          onClick={() => setShowSessionsModal(true)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={shouldAnimate ? styles.agentContentSlide : ""}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "var(--base-size-6, 0.25rem)",
            cursor: "pointer",
            borderRadius: "var(--borderRadius-medium, 6px)",
            transition: "background-color 0.2s",
            minHeight: "32px",
            paddingInline: "var(--base-size-8, 0.5rem)",
            backgroundColor: isHovering
              ? "var(--control-bgColor-hover, #f6f8fa)"
              : "transparent",
          }}
        >
          {/* Avatar Stack */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <AvatarStack size={20} disableExpand>
            {agentDetails.map((agent) => (
              <Avatar
                key={agent!.name}
                src={agent!.avatar}
                alt={agent!.name}
              />
            ))}
            {customSessionAvatars.map((agent, index) => (
              <Avatar
                key={`custom-${index}`}
                src={agent!.avatar}
                alt={agent!.name}
              />
            ))}
            </AvatarStack>
          </div>
          <span
            style={{
              fontSize: "var(--text-body-size-small, 0.875rem)",
              flex: 1,
              fontWeight: 'var(--base-text-weight-medium, 500)',
            }}
          >
            {totalSessionCount} agent session
            {totalSessionCount !== 1 ? "s" : ""}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <IconButton
              icon={PlusIcon}
              variant="invisible"
              size="small"
              aria-label="Configure agent session"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateCustomSession();
              }}
              style={{
                opacity: isHovering ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            />
            <Loader2
              size={14}
              className={styles.spinAnimation}
              style={{
                color: "var(--fgColor-muted, #656d76)",
              }}
            />
          </div>
        </div>
      </div>

      {showSessionsModal &&
        sessionsRef.current &&
        createPortal(
          <>
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
              }}
              onClick={() => setShowSessionsModal(false)}
            />
            <div
              style={{
                position: "fixed",
                top: `${
                  sessionsRef.current.getBoundingClientRect().bottom + 8
                }px`,
                left: `${sessionsRef.current.getBoundingClientRect().left}px`,
                width: "400px",
                maxWidth: "90vw",
                maxHeight: "80vh",
                overflowY: "auto",
                zIndex: 101,
                background: "var(--bgColor-default, #ffffff)",
                border:
                  "var(--borderWidth-thin, 1px) solid var(--borderColor-default, #d0d7de)",
                borderRadius: "var(--borderRadius-large, 12px)",
                padding: "var(--base-size-16, 1rem)",
                boxShadow:
                  "var(--shadow-floating-large, 0 12px 28px rgba(0, 0, 0, 0.15))",
              }}
            >
              <div style={{ marginBottom: "var(--base-size-16, 1rem)" }}>
                <h3
                  style={{
                    fontSize: "var(--text-title-size-small, 1rem)",
                    fontWeight: "var(--base-text-weight-semibold, 600)",
                    marginBottom: "var(--base-size-8, 0.5rem)",
                  }}
                >
                  Agent Sessions
                </h3>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--base-size-12, 0.75rem)",
                }}
              >
                {agentsValue.map((agent, index) => (
                  <div
                    key={agent}
                    style={{
                      border:
                        "var(--borderWidth-thin, 1px) solid var(--borderColor-default, #d0d7de)",
                      borderRadius: "var(--borderRadius-medium, 6px)",
                      padding: "var(--base-size-12, 0.75rem)",
                      backgroundColor: "var(--bgColor-muted, #f6f8fa)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--base-size-8, 0.5rem)",
                        marginBottom: "var(--base-size-8, 0.5rem)",
                      }}
                    >
                      <AgentIcon size={16} />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: "var(--base-text-weight-medium, 500)",
                            fontSize: "var(--text-body-size-small, 0.875rem)",
                          }}
                        >
                          {issue.title}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--text-body-size-small, 0.75rem)",
                            color: "var(--fgColor-muted, #656d76)",
                          }}
                        >
                          {agent.charAt(0).toUpperCase() + agent.slice(1)} •{" "}
                          {index === 0 ? "6m 14s" : "2s"}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-body-size-small, 0.75rem)",
                        color: "var(--fgColor-muted, #656d76)",
                        marginBottom: "var(--base-size-8, 0.5rem)",
                      }}
                    >
                      Running test suites
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "4px",
                        backgroundColor: "var(--borderColor-default, #d0d7de)",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: index === 0 ? "60%" : "75%",
                          height: "100%",
                          backgroundColor: "var(--fgColor-accent, #0969da)",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                ))}

                {customSessions.map((session) => (
                  <div
                    key={session.id}
                    style={{
                      border:
                        "var(--borderWidth-thin, 1px) solid var(--borderColor-default, #d0d7de)",
                      borderRadius: "var(--borderRadius-medium, 6px)",
                      padding: "var(--base-size-12, 0.75rem)",
                      backgroundColor: "var(--bgColor-muted, #f6f8fa)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--base-size-8, 0.5rem)",
                        marginBottom: "var(--base-size-8, 0.5rem)",
                      }}
                    >
                      <AgentIcon size={16} />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: "var(--base-text-weight-medium, 500)",
                            fontSize: "var(--text-body-size-small, 0.875rem)",
                          }}
                        >
                          {session.repo} / {session.branch}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--text-body-size-small, 0.75rem)",
                            color: "var(--fgColor-muted, #656d76)",
                          }}
                        >
                          {session.agent.charAt(0).toUpperCase() + session.agent.slice(1)} •{" "}
                          {Math.floor((Date.now() - session.createdAt) / 1000)}s
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-body-size-small, 0.75rem)",
                        color: "var(--fgColor-muted, #656d76)",
                        marginBottom: "var(--base-size-8, 0.5rem)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {session.instructions}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "4px",
                        backgroundColor: "var(--borderColor-default, #d0d7de)",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${session.progress}%`,
                          height: "100%",
                          backgroundColor: session.status === 'running' 
                            ? "var(--fgColor-accent, #0969da)"
                            : session.status === 'completed'
                            ? "var(--fgColor-success, #1a7f37)"
                            : "var(--fgColor-danger, #cf222e)",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>,
          document.body
        )}
      <CreateAgentSessionDialog
        isOpen={isCreateSessionDialogOpen}
        onClose={() => setIsCreateSessionDialogOpen(false)}
        onSubmit={handleSubmitCustomSession}
      />
    </>
  );
}
