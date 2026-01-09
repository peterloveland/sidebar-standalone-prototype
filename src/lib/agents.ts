export interface Agent {
  id: string;
  name: string;
  avatar: string;
  model?: string;
}

export const AGENTS: Agent[] = [
  {
    id: 'copilot',
    name: 'Copilot',
    avatar: 'https://github.com/github.png',
    model: 'gpt-4.5',
  },
  {
    id: 'claude',
    name: 'Claude',
    avatar: 'https://github.com/anthropics.png',
    model: 'sonnet-4.5',
  },
  {
    id: 'codex',
    name: 'Codex',
    avatar: 'https://github.com/openai.png',
    model: 'codex-2',
  },
];

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find(agent => agent.id === id);
}

export function getAgentByName(name: string): Agent | undefined {
  return AGENTS.find(agent => agent.name.toLowerCase() === name.toLowerCase() || agent.id === name);
}
