import { IssueField_text } from './IssueField_text';
import { IssueField_number } from './IssueField_number';
import { IssueField_singleSelect } from './IssueField_singleSelect';
import { IssueField_multiSelect } from './IssueField_multiSelect';
import { IssueField_date } from './IssueField_date';
import { db, type ProjectFieldDefinition } from '../lib/db';
import styles from './IssueFieldsContainer.module.css';

interface ProjectFieldsContainerProps {
  projectId: string;
}

export function ProjectFieldsContainer({ projectId }: ProjectFieldsContainerProps) {
  const project = db.getProjectById(projectId);

  if (!project) {
    return null;
  }

  const updateField = (fieldName: string, value: any) => {
    db.updateProject(projectId, {
      fields: {
        ...project.fields,
        [fieldName]: value,
      },
    });
    window.dispatchEvent(new Event('storage'));
  };

  // Get the project field definitions
  const fieldIds = db.getDefaultProjectFieldIds();
  const fields = fieldIds
    .map(fieldId => db.getProjectFieldDefinition(fieldId))
    .filter((field): field is ProjectFieldDefinition => field !== undefined);

  const renderField = (field: ProjectFieldDefinition) => {
    const value = project.fields?.[field.id];

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
    <div className={styles.fieldsContainer}>
      {fields.map((field) => (
        <div key={field.id}>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
}
