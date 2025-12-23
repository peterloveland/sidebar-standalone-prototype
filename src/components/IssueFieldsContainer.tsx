import { SidebarLabel } from './SidebarLabel';
import { IssueField_text } from './IssueField_text';
import { IssueField_number } from './IssueField_number';
import { IssueField_singleSelect } from './IssueField_singleSelect';
import { IssueField_multiSelect } from './IssueField_multiSelect';
import { IssueField_date } from './IssueField_date';
import { db, type FieldDefinition } from '../lib/db';

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

  // Get the fields for this issue type
  const typeConfig = issue.type ? db.getIssueTypeConfig(issue.type) : null;
  
  // Use default fields if no type is set
  const fieldIds = typeConfig ? typeConfig.fieldIds : db.getDefaultFieldIds();

  const fields = fieldIds
    .map(fieldId => db.getFieldDefinition(fieldId))
    .filter((field): field is FieldDefinition => field !== undefined);

  const renderField = (field: FieldDefinition) => {
    const value = issue.fields?.[field.id];

    switch (field.type) {
      case 'text':
        return (
          <IssueField_text
            key={field.id}
            label={field.label}
            value={value || ''}
            onChange={(val) => updateField(field.id, val)}
            description={field.description}
          />
        );

      case 'number':
        return (
          <IssueField_number
            key={field.id}
            label={field.label}
            value={value ?? null}
            onChange={(val) => updateField(field.id, val)}
            description={field.description}
          />
        );

      case 'date':
        return (
          <IssueField_date
            key={field.id}
            label={field.label}
            value={value || null}
            onChange={(val) => updateField(field.id, val)}
            description={field.description}
          />
        );

      case 'singleSelect':
        return (
          <IssueField_singleSelect
            key={field.id}
            label={field.label}
            value={value || null}
            options={field.options || []}
            onChange={(val) => updateField(field.id, val)}
            description={field.description}
          />
        );

      case 'multiSelect':
        return (
          <IssueField_multiSelect
            key={field.id}
            label={field.label}
            value={value || []}
            options={field.options || []}
            onChange={(val) => updateField(field.id, val)}
            description={field.description}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <SidebarLabel showPlusIcon={false}>Fields</SidebarLabel>
      {fields.map(renderField)}
    </div>
  );
}
