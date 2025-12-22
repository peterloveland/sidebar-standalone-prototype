import { useState, useEffect } from 'react';
import { db, type Issue } from '../lib/db';

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);

  const loadIssues = () => {
    setIssues(db.getAll());
  };

  useEffect(() => {
    loadIssues();
    
    // Listen for storage events from other tabs
    const handleStorage = () => {
      loadIssues();
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const createIssue = (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIssue = db.create(issue);
    loadIssues();
    return newIssue;
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    const updated = db.update(id, updates);
    loadIssues();
    return updated;
  };

  const deleteIssue = (id: string) => {
    const deleted = db.delete(id);
    loadIssues();
    return deleted;
  };

  const toggleIssueState = (id: string) => {
    const issue = db.getById(id);
    if (issue) {
      updateIssue(id, { state: issue.state === 'open' ? 'closed' : 'open' });
    }
  };

  return {
    issues,
    createIssue,
    updateIssue,
    deleteIssue,
    toggleIssueState,
    refresh: loadIssues,
  };
}
