import { db } from '../lib/db';
import { AssigneeRow } from './AssigneeRow';
import { AgentsRow } from './AgentsRow';
import styles from './IssueSidebar.module.css';
import { LabelsRow } from './LabelsRow';
import { ProjectsRow } from './ProjectsRow';
import { MilestonesRow } from './MilestonesRow';
import { RelationshipsRow } from './RelationshipsRow';
import { IssueFieldsContainer } from './IssueFieldsContainer';
import { HeightAnimationDemo } from './HeightAnimationDemo';

interface IssueSidebarProps {
  issueId: string;
}

export function IssueSidebar({ issueId }: IssueSidebarProps) {
  const issue = db.getById(issueId);

  if (!issue) {
    return (
      <div className={styles.notFound}>
        Issue not found
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div>
        <AssigneeRow issueId={issueId} />
        <AgentsRow issueId={issueId} />
      </div>
      <LabelsRow issueId={issueId} />
      <IssueFieldsContainer issueId={issueId} />
      <ProjectsRow issueId={issueId} />
      <MilestonesRow issueId={issueId} />
      <RelationshipsRow issueId={issueId} />
    </div>
  );
}
