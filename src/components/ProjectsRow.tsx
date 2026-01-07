import { useState, useEffect } from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import { ActionList } from '@primer/react';
import { SidebarLabel } from './SidebarLabel';
import { Project } from './Project';
import { ProjectFieldsContainer } from './ProjectFieldsContainer';
import { db } from '../lib/db';
import styles from './IssueSidebar.module.css';
import { useHeightAnimation } from '../hooks/useHeightAnimation';

interface ProjectsRowProps {
  issueId: string;
}

type ViewMode = 'list' | 'detail';

export function ProjectsRow({ issueId }: ProjectsRowProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const { lockHeight, animateToAuto, getContainerProps } = useHeightAnimation(300);
  
  // Get projects for this issue
  const projects = db.getProjectsByIssueId(issueId);
  const allProjects = db.getProjects();
  const availableProjects = allProjects.filter(p => !p.issueIds.includes(issueId));

  // Listen for storage changes to refresh projects
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render when storage changes
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleExpand = (projectId: string) => {
    lockHeight();
    setSelectedProjectId(projectId);
    setViewMode('detail');
  };

  const handleBack = () => {
    lockHeight();
    setViewMode('list');
    setSelectedProjectId(null);
  };

  // Animate when view mode changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure the DOM has updated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animateToAuto();
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleStatusChange = (projectId: string, status: string | null) => {
    db.updateProject(projectId, { status });
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddProject = (projectId: string) => {
    db.addIssueToProject(projectId, issueId);
    window.dispatchEvent(new Event('storage'));
    setIsAddingProject(false);
  };

  const handleRemoveProject = (projectId: string) => {
    db.removeIssueFromProject(projectId, issueId);
    window.dispatchEvent(new Event('storage'));
    // If we're viewing the project being removed, go back to list
    if (selectedProjectId === projectId) {
      handleBack();
    }
  };

  const containerProps = getContainerProps();

  const renderListView = () => {
    return (
      <div>
        <SidebarLabel 
          showPlusIcon={availableProjects.length > 0}
          onClick={() => availableProjects.length > 0 && setIsAddingProject(!isAddingProject)}
          isActive={isAddingProject}
        >
          Projectss
        </SidebarLabel>
        
        {isAddingProject && (
          <div style={{ marginBottom: '8px' }}>
            <ActionList>
              {availableProjects.map((project) => (
                <ActionList.Item
                  key={project.id}
                  onSelect={() => handleAddProject(project.id)}
                >
                  <ActionList.LeadingVisual>
                    <Plus size={16} />
                  </ActionList.LeadingVisual>
                  {project.title}
                </ActionList.Item>
              ))}
            </ActionList>
          </div>
        )}

        <div>
          {projects.length === 0 ? (
            <div style={{ padding: '0', color: 'var(--fgColor-muted)', fontSize: '12px' }}>
              No projects
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {projects.map((project) => (
                <Project
                  key={project.id}
                  id={project.id}
                  name={project.title}
                  status={project.status}
                  onExpand={() => handleExpand(project.id)}
                  onStatusChange={(status) => handleStatusChange(project.id, status)}
                />
              ))}
            </div>
          )}
        </div>
    </div>
    );
  };

  const renderDetailView = () => {
    const project = selectedProjectId ? db.getProjectById(selectedProjectId) : null;
    
    if (!project) {
      return null;
    }

    return (
      <>
        <SidebarLabel 
          showPlusIcon={false}
          trailingVisual={
            <button
              onClick={handleBack}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--fgColor-muted)',
              }}
            >
              <ChevronLeft size={16} />
            </button>
          }
        >
          {project.title}
        </SidebarLabel>

        <div>
          <ProjectFieldsContainer projectId={project.id} />
          
          <button
            onClick={() => handleRemoveProject(project.id)}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '6px 12px',
              background: 'none',
              border: '1px solid var(--borderColor-default)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'var(--fgColor-danger)',
            }}
          >
            Remove from project
          </button>
        </div>
      </>
    );
  };

  return (
    <div {...containerProps} className={containerProps.className}>
      {viewMode === 'list' ? renderListView() : renderDetailView()}
    </div>
  );
}
