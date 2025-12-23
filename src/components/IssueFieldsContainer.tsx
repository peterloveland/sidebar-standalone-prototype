import { SidebarLabel } from './SidebarLabel';
import { IssueField_text } from './IssueField_text';
import { IssueField_number } from './IssueField_number';
import { IssueField_singleSelect } from './IssueField_singleSelect';
import { IssueField_multiSelect } from './IssueField_multiSelect';
import { IssueField_date } from './IssueField_date';

interface IssueFieldsContainerProps {
  issueId: string;
}

export function IssueFieldsContainer({ issueId }: IssueFieldsContainerProps) {
  return (
    <div>
      <SidebarLabel showPlusIcon={false}>Fields</SidebarLabel>
      
      <IssueField_text
        label="DRI"
        value="@monalisa"
        onChange={(value) => console.log('DRI changed:', value)}
      />
      
      <IssueField_singleSelect
        label="Priority"
        value="P0"
        options={[
          { label: 'P0', value: 'P0' },
          { label: 'P1', value: 'P1' },
          { label: 'P2', value: 'P2' },
          { label: 'P3', value: 'P3' },
        ]}
        onChange={(value) => console.log('Priority changed:', value)}
      />
      
      <IssueField_date
        label="Start date"
        value="2025-12-25T00:00:00.000Z"
        onChange={(value) => console.log('Start date changed:', value)}
      />
      
      <IssueField_date
        label="Target date"
        value="2025-12-25T00:00:00.000Z"
        onChange={(value) => console.log('Target date changed:', value)}
      />
      
      <IssueField_singleSelect
        label="Trending"
        value="on-track"
        options={[
          { label: 'On track', value: 'on-track' },
          { label: 'At risk', value: 'at-risk' },
          { label: 'Off track', value: 'off-track' },
        ]}
        onChange={(value) => console.log('Trending changed:', value)}
      />
      
      <IssueField_number
        label="Engineering staffing"
        value={3}
        onChange={(value) => console.log('Engineering staffing changed:', value)}
      />
    </div>
  );
}
