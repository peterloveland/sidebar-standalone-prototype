import { SidebarLabel } from './SidebarLabel';
import { IssueField_text } from './IssueField_text';
import { IssueField_number } from './IssueField_number';
import { IssueField_singleSelect } from './IssueField_singleSelect';
import { IssueField_multiSelect } from './IssueField_multiSelect';
import { IssueField_date } from './IssueField_date';
import { db } from '../lib/db';

interface IssueFieldsContainerProps {
  issueId: string;
}

export function IssueFieldsContainer({ issueId }: IssueFieldsContainerProps) {
  const issue = db.getById(issueId);

  if (!issue) {
    return null;
  }

  const updateField = (fieldName: string, value: any) => {
    db.update(issueId, {
      fields: {
        ...issue.fields,
        [fieldName]: value,
      },
    });
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div>
      <SidebarLabel showPlusIcon={false}>Fields</SidebarLabel>
      
      <IssueField_text
        label="DRI"
        value={issue.fields?.dri || ''}
        onChange={(value) => updateField('dri', value)}
        // forceEdit={true}
      />
      
      <IssueField_singleSelect
        label="Priority"
        value={issue.fields?.priority || null}
        options={[
          { label: 'P0', value: 'P0' },
          { label: 'P1', value: 'P1' },
          { label: 'P2', value: 'P2' },
          { label: 'P3', value: 'P3' },
        ]}
        onChange={(value) => updateField('priority', value)}
      />
      
      <IssueField_date
        label="Start date"
        value={issue.fields?.startDate || null}
        onChange={(value) => updateField('startDate', value)}
      />
      
      <IssueField_date
        label="Target date"
        value={issue.fields?.targetDate || null}
        onChange={(value) => updateField('targetDate', value)}
      />
      
      <IssueField_singleSelect
        label="Trending"
        value={issue.fields?.trending || null}
        options={[
          { label: 'On track', value: 'on-track' },
          { label: 'At risk', value: 'at-risk' },
          { label: 'Off track', value: 'off-track' },
        ]}
        onChange={(value) => updateField('trending', value)}
      />
      
      <IssueField_number
        label="Engineering staffing"
        value={issue.fields?.engineeringStaffing ?? null}
        onChange={(value) => updateField('engineeringStaffing', value)}
      />
    </div>
  );
}
