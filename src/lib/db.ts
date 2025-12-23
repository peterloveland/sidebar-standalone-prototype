export type ColorName = 'blue' | 'green' | 'red' | 'orange' | 'yellow' | 'purple' | 'gray';

export interface SelectOption {
  label: string;
  value: string;
  color: ColorName;
}

export type FieldType = 'text' | 'number' | 'date' | 'singleSelect' | 'multiSelect';

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  description: string;
  options?: SelectOption[]; // For select fields
}

export type IssueType = 'bug' | 'epic' | 'task' | 'feature';

export interface IssueTypeConfig {
  type: IssueType;
  label: string;
  fieldIds: string[]; // References to FieldDefinition.id
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  type?: IssueType;
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
    tags?: string[];
  };
}

const STORAGE_KEY = 'github-issues-prototype';
const FIELD_DEFS_KEY = 'github-field-definitions';
const ISSUE_TYPES_KEY = 'github-issue-types';

// Field definitions that can be used across different issue types
const defaultFieldDefinitions: FieldDefinition[] = [
  {
    id: 'dri',
    label: 'DRI',
    type: 'text',
    description: 'Directly Responsible Individual for this issue',
  },
  {
    id: 'priority',
    label: 'Priority',
    type: 'singleSelect',
    description: 'Priority level for this issue',
    options: [
      { label: 'P0', value: 'P0', color: 'red' },
      { label: 'P1', value: 'P1', color: 'orange' },
      { label: 'P2', value: 'P2', color: 'yellow' },
      { label: 'P3', value: 'P3', color: 'gray' },
    ],
  },
  {
    id: 'severity',
    label: 'Severity',
    type: 'singleSelect',
    description: 'Impact severity of the bug',
    options: [
      { label: 'Critical', value: 'critical', color: 'red' },
      { label: 'High', value: 'high', color: 'orange' },
      { label: 'Medium', value: 'medium', color: 'yellow' },
      { label: 'Low', value: 'low', color: 'gray' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    type: 'singleSelect',
    description: 'Current status of work',
    options: [
      { label: 'Not Started', value: 'not-started', color: 'gray' },
      { label: 'In Progress', value: 'in-progress', color: 'blue' },
      { label: 'In Review', value: 'in-review', color: 'purple' },
      { label: 'Blocked', value: 'blocked', color: 'red' },
      { label: 'Done', value: 'done', color: 'green' },
    ],
  },
  {
    id: 'startDate',
    label: 'Start date',
    type: 'date',
    description: 'When work begins on this issue',
  },
  {
    id: 'targetDate',
    label: 'Target date',
    type: 'date',
    description: 'Expected completion date',
  },
  {
    id: 'dueDate',
    label: 'Due date',
    type: 'date',
    description: 'Hard deadline for completion',
  },
  {
    id: 'trending',
    label: 'Trending',
    type: 'singleSelect',
    description: 'Progress trajectory indicator',
    options: [
      { label: 'On track', value: 'on-track', color: 'green' },
      { label: 'At risk', value: 'at-risk', color: 'orange' },
      { label: 'Off track', value: 'off-track', color: 'red' },
    ],
  },
  {
    id: 'engineeringStaffing',
    label: 'Engineering staffing',
    type: 'number',
    description: 'Number of engineers assigned',
  },
  {
    id: 'storyPoints',
    label: 'Story points',
    type: 'number',
    description: 'Estimated effort in story points',
  },
  {
    id: 'reproSteps',
    label: 'Reproduction steps',
    type: 'text',
    description: 'Steps to reproduce the bug',
  },
  {
    id: 'environment',
    label: 'Environment',
    type: 'singleSelect',
    description: 'Environment where the issue occurs',
    options: [
      { label: 'Production', value: 'production', color: 'red' },
      { label: 'Staging', value: 'staging', color: 'orange' },
      { label: 'Development', value: 'development', color: 'blue' },
    ],
  },
  {
    id: 'epicLink',
    label: 'Epic',
    type: 'text',
    description: 'Link to parent epic',
  },
  {
    id: 'tags',
    label: 'Tags',
    type: 'multiSelect',
    description: 'Categorization tags',
    options: [
      { label: 'Frontend', value: 'frontend', color: 'blue' },
      { label: 'Backend', value: 'backend', color: 'purple' },
      { label: 'Database', value: 'database', color: 'green' },
      { label: 'API', value: 'api', color: 'orange' },
      { label: 'UI/UX', value: 'ui-ux', color: 'red' },
      { label: 'Performance', value: 'performance', color: 'yellow' },
    ],
  },
];

// Default fields for issues without a type
const defaultFieldIds = ['priority', 'status', 'dri', 'tags'];

// Issue type configurations
const defaultIssueTypes: IssueTypeConfig[] = [
  {
    type: 'bug',
    label: 'Bug',
    fieldIds: ['priority', 'severity', 'status', 'dri', 'dueDate', 'reproSteps', 'environment', 'tags'],
  },
  {
    type: 'feature',
    label: 'Feature',
    fieldIds: ['priority', 'status', 'dri', 'startDate', 'targetDate', 'trending', 'engineeringStaffing', 'storyPoints', 'tags'],
  },
  {
    type: 'epic',
    label: 'Epic',
    fieldIds: ['priority', 'status', 'dri', 'startDate', 'targetDate', 'trending', 'engineeringStaffing', 'tags'],
  },
  {
    type: 'task',
    label: 'Task',
    fieldIds: ['priority', 'status', 'dri', 'dueDate', 'storyPoints', 'epicLink', 'tags'],
  },
];

// Initialize with some sample data
const sampleIssues: Issue[] = [
  {
    id: '1',
    number: 1,
    title: 'Add dark mode support',
    type: 'feature',
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
      tags: ['frontend', 'ui-ux'],
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
    type: 'task',
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
    type: 'epic',
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

  getFieldDefinitions(): FieldDefinition[] {
    try {
      const data = localStorage.getItem(FIELD_DEFS_KEY);
      if (!data) {
        localStorage.setItem(FIELD_DEFS_KEY, JSON.stringify(defaultFieldDefinitions));
        return defaultFieldDefinitions;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading field definitions:', error);
      return defaultFieldDefinitions;
    }
  }

  getFieldDefinition(id: string): FieldDefinition | undefined {
    return this.getFieldDefinitions().find(field => field.id === id);
  }

  getIssueTypes(): IssueTypeConfig[] {
    try {
      const data = localStorage.getItem(ISSUE_TYPES_KEY);
      if (!data) {
        localStorage.setItem(ISSUE_TYPES_KEY, JSON.stringify(defaultIssueTypes));
        return defaultIssueTypes;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading issue types:', error);
      return defaultIssueTypes;
    }
  }

  getIssueTypeConfig(type: IssueType): IssueTypeConfig | undefined {
    return this.getIssueTypes().find(config => config.type === type);
  }

  getDefaultFieldIds(): string[] {
    return defaultFieldIds;
  }
}

export const db = new IssuesDB();
