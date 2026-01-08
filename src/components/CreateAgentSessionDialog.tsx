import { useState, useCallback } from 'react';
import { Textarea, ActionMenu, ActionList } from '@primer/react';
import { Dialog } from '@primer/react/experimental';
import { RepoIcon, GitBranchIcon } from '@primer/octicons-react';

interface CreateAgentSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { instructions: string; repo: string; branch: string; agent: string }) => void;
}

const REPOS = [
  { id: 'octoarcade/invaders', name: 'octoarcade/invaders' },
  { id: 'acme/frontend', name: 'acme/frontend' },
  { id: 'acme/api', name: 'acme/api' },
  { id: 'acme/dashboard', name: 'acme/dashboard' },
];

const BRANCHES = [
  { id: 'main', name: 'main' },
  { id: 'develop', name: 'develop' },
  { id: 'feature/auth', name: 'feature/auth' },
];

const AGENTS = [
  { id: 'copilot', name: 'Copilot', model: 'gpt-4.5', avatar: 'https://github.com/github.png' },
  { id: 'claude', name: 'Claude', model: 'sonnet-4.5', avatar: 'https://github.com/anthropics.png' },
  { id: 'codex', name: 'Codex', model: 'codex-2', avatar: 'https://github.com/openai.png' },
];

export function CreateAgentSessionDialog({ isOpen, onClose, onSubmit }: CreateAgentSessionDialogProps) {
  const [instructions, setInstructions] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(REPOS[0]);
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[1]); // Default to Claude

  const handleClose = useCallback(() => {
    setInstructions('');
    setSelectedRepo(REPOS[0]);
    setSelectedBranch(BRANCHES[0]);
    setSelectedAgent(AGENTS[1]);
    onClose();
  }, [onClose]);

  const handleSubmit = () => {
    onSubmit?.({
      instructions,
      repo: selectedRepo.id,
      branch: selectedBranch.id,
      agent: selectedAgent.id,
    });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog
      title="Start a custom session"
      subtitle="Create a new task for an agent to complete. Add custom instructions to steer it toward your desired outcome."
      onClose={handleClose}
      width="large"
      footerButtons={[
        { buttonType: 'default', content: 'Cancel', onClick: handleClose },
        { buttonType: 'primary', content: 'Create session', onClick: handleSubmit },
      ]}
    >
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px',
              color: 'var(--fgColor-default)',
            }}
          >
            Custom instructions
          </label>
          <Textarea
            placeholder="Describe what you want the agent to do..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            block
            rows={4}
            resize="vertical"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Repo Dropdown */}
          <ActionMenu>
            <ActionMenu.Button leadingVisual={RepoIcon}>
              {selectedRepo.name}
            </ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList selectionVariant="single">
                {REPOS.map((repo) => (
                  <ActionList.Item
                    key={repo.id}
                    selected={selectedRepo.id === repo.id}
                    onSelect={() => setSelectedRepo(repo)}
                  >
                    {repo.name}
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>

          {/* Branch Dropdown */}
          <ActionMenu>
            <ActionMenu.Button leadingVisual={GitBranchIcon}>
              {selectedBranch.name}
            </ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList selectionVariant="single">
                {BRANCHES.map((branch) => (
                  <ActionList.Item
                    key={branch.id}
                    selected={selectedBranch.id === branch.id}
                    onSelect={() => setSelectedBranch(branch)}
                  >
                    {branch.name}
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>

          {/* Agent Dropdown */}
          <ActionMenu>
            <ActionMenu.Button
              leadingVisual={() => (
                <img
                  src={selectedAgent.avatar}
                  alt={selectedAgent.name}
                  style={{ width: '16px', height: '16px', borderRadius: '50%' }}
                />
              )}
            >
              {selectedAgent.name}
            </ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList selectionVariant="single">
                {AGENTS.map((agent) => (
                  <ActionList.Item
                    key={agent.id}
                    selected={selectedAgent.id === agent.id}
                    onSelect={() => setSelectedAgent(agent)}
                  >
                    <ActionList.LeadingVisual>
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        style={{ width: '16px', height: '16px', borderRadius: '50%' }}
                      />
                    </ActionList.LeadingVisual>
                    {agent.name}
                    <ActionList.Description variant="block">
                      {agent.model}
                    </ActionList.Description>
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>

          {/* Model display */}
          <span style={{ marginLeft: 'auto', fontSize: '14px', color: 'var(--fgColor-muted)' }}>
            {selectedAgent.model}
          </span>
        </div>
      </div>
    </Dialog>
  );
}
