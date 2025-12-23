export interface Issue {
  id: string;
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: string[];
  assignees: string[];
  agents: string[];
  createdAt: string;
  updatedAt: string;
  comments: number;
  description?: string;
  fields?: {
    dri?: string;
    priority?: string;
    startDate?: string;
    targetDate?: string;
    trending?: string;
    engineeringStaffing?: number;
  };
}

const STORAGE_KEY = 'github-issues-prototype';

// Initialize with some sample data
const sampleIssues: Issue[] = [
  {
    id: '1',
    number: 1,
    title: 'Add dark mode support',
    state: 'open',
    labels: ['enhancement', 'good first issue'],
    assignees: ['johndoe'],
    agents: ['copilot'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    comments: 5,
    description: 'We need to add dark mode support to improve user experience in low-light environments.',
    fields: {
      dri: '@monalisa',
      priority: 'P0',
      startDate: '2025-12-25T00:00:00.000Z',
      targetDate: '2025-12-25T00:00:00.000Z',
      trending: 'on-track',
      engineeringStaffing: 3,
    },
  },
  {
    id: '2',
    number: 2,
    title: 'Fix navigation bug on mobile',
    state: 'open',
    labels: ['bug', 'mobile'],
    assignees: [],
    agents: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    comments: 2,
    description: 'Navigation menu is not working properly on mobile devices.',
  },
  {
    id: '3',
    number: 3,
    title: 'Update documentation',
    state: 'closed',
    labels: ['documentation'],
    assignees: ['janedoe', 'alice'],
    agents: ['claude'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    comments: 8,
    description: 'Documentation needs to be updated with the latest API changes.',
  },
  {
    id: '4',
    number: 4,
    title: 'Improve performance on large datasets',
    state: 'open',
    labels: ['performance', 'enhancement'],
    assignees: [],
    agents: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    comments: 0,
    description: 'The application is slow when dealing with large datasets.',
  },
];

class IssuesDB {
  private getIssues(): Issue[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Initialize with sample data
        this.saveIssues(sampleIssues);
        return sampleIssues;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return sampleIssues;
    }
  }

  private saveIssues(issues: Issue[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  getAll(): Issue[] {
    return this.getIssues();
  }

  getById(id: string): Issue | undefined {
    return this.getIssues().find(issue => issue.id === id);
  }

  create(issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Issue {
    const issues = this.getIssues();
    const maxNumber = Math.max(...issues.map(i => i.number), 0);
    const newIssue: Issue = {
      ...issue,
      id: Date.now().toString(),
      number: maxNumber + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveIssues([...issues, newIssue]);
    return newIssue;
  }

  update(id: string, updates: Partial<Issue>): Issue | undefined {
    const issues = this.getIssues();
    const index = issues.findIndex(issue => issue.id === id);
    if (index === -1) return undefined;

    const updatedIssue = {
      ...issues[index],
      ...updates,
      id: issues[index].id, // Preserve id
      number: issues[index].number, // Preserve number
      createdAt: issues[index].createdAt, // Preserve createdAt
      updatedAt: new Date().toISOString(),
    };

    issues[index] = updatedIssue;
    this.saveIssues(issues);
    return updatedIssue;
  }

  delete(id: string): boolean {
    const issues = this.getIssues();
    const filtered = issues.filter(issue => issue.id !== id);
    if (filtered.length === issues.length) return false;
    this.saveIssues(filtered);
    return true;
  }

  filter(predicate: (issue: Issue) => boolean): Issue[] {
    return this.getIssues().filter(predicate);
  }
}

export const db = new IssuesDB();
