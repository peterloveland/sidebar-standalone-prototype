import { useState, useRef, useEffect } from 'react';
import { AgentIcon, PlusIcon } from '@primer/octicons-react';
import { Settings, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Avatar, AvatarStack, IconButton } from '@primer/react';
import { db } from '../lib/db';
import styles from './IssueSidebar.module.css';

interface AgentsRowProps {
  issueId: string;
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

export function AgentsRow({ issueId }: AgentsRowProps) {
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
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

  if (!issue) {
    return null;
  }

  const agentsValue = issue.agents || [];

  const handleCreateCustomSession = () => {
    alert('Create a new custom agent session');
  };

  if (agentsValue.length === 0) {
    return null;
  }

  // Get agent info with avatars
  const agentDetails = agentsValue.map(agentName => 
    AGENTS.find(a => a.name === agentName)
  ).filter(Boolean);

  return (
    <>
      <div className={styles.agentsRowContainer}>
        <svg
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
                
            {agentDetails.map((agent, index) => (
              <Avatar
                key={agent!.name}
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
            {agentsValue.length} agent session
            {agentsValue.length !== 1 ? "s" : ""}
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
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
