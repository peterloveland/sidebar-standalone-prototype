import { useState, useEffect } from 'react';
import { ArrowUpRight, ChevronLeft, Plus } from 'lucide-react';
import { ActionList, AnchoredOverlay, Button, TextInput } from '@primer/react';
import { SidebarLabel } from './SidebarLabel';
import { Project } from './Project';
import { ProjectFieldsContainer } from './ProjectFieldsContainer';
import { db } from '../lib/db';
import styles from './IssueSidebar.module.css';
import projectStyles from './Project.module.css';
import { useHeightAnimation } from '../hooks/useHeightAnimation';
import { IconButton } from './ui/IconButton';
import { ArrowLeftIcon } from '@primer/octicons-react';

interface ProjectsRowProps {
  issueId: string;
}

type ViewMode = 'list' | 'detail';

export function ProjectsRow({ issueId }: ProjectsRowProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    setViewMode("detail");
    requestAnimationFrame(() => {
      animateToAuto();
    });
  };

  const handleBack = () => {
    lockHeight();
    // alert("asdasd")
    setViewMode('list');
    // setSelectedProjectId(null);
    requestAnimationFrame(() => {
      animateToAuto();
    });
  };

  // // Animate when view mode changes
  // useEffect(() => {
  //   // Use requestAnimationFrame to ensure the DOM has updated
  //       animateToAuto();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [viewMode]);

  const handleStatusChange = (projectId: string, status: string | null) => {
    db.updateProject(projectId, { status });
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddProject = (projectId: string) => {
    db.addIssueToProject(projectId, issueId);
    window.dispatchEvent(new Event('storage'));
    setIsAddingProject(false);
    setSearchQuery('');
  };

  const handleToggleProject = (projectId: string) => {
    const isSelected = projects.some(p => p.id === projectId);
    if (isSelected) {
      db.removeIssueFromProject(projectId, issueId);
    } else {
      db.addIssueToProject(projectId, issueId);
    }
    window.dispatchEvent(new Event('storage'));
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
    const filteredProjects = availableProjects.filter(project =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div>
        <AnchoredOverlay
          open={isAddingProject}
          onOpen={() => setIsAddingProject(true)}
          onClose={() => {
            setIsAddingProject(false);
            setSearchQuery('');
          }}
          renderAnchor={(anchorProps) => (
            <SidebarLabel 
              {...anchorProps}
              showPlusIcon={true}
              onClick={() => setIsAddingProject(!isAddingProject)}
              isActive={isAddingProject}
            >
              Projects
            </SidebarLabel>
          )}
          side="outside-bottom"
          align="start"
        >
          <div style={{ width: "296px" }}>
            <div style={{ padding: '8px' }}>
              <TextInput
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                block
              />
            </div>
            <ActionList selectionVariant="multiple">
              {allProjects
                .filter(project => project.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((project) => {
                  const isSelected = projects.some(p => p.id === project.id);
                  return (
                    <ActionList.Item
                      key={project.id}
                      selected={isSelected}
                      role="menuitemcheckbox"
                      aria-checked={isSelected}
                      onSelect={() => handleToggleProject(project.id)}
                    >
                      {project.title}
                    </ActionList.Item>
                  );
                })}
              {allProjects.filter(project => project.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <ActionList.Item disabled>
                  No matching projects
                </ActionList.Item>
              )}
            </ActionList>
          </div>
        </AnchoredOverlay>

        <div>
          {projects.length === 0 ? (
            <div style={{ padding: '0', color: 'var(--fgColor-muted)', fontSize: '12px' }}>
              No projects
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "var(--text-body-size-medium, 14px)",
            fontWeight: "var(--base-text-weight-semibold, 600)",
            lineHeight: "var(--text-body-lineHeight-medium, 20px)",
            color: "var(--fgColor-muted)",
            minHeight: "32px",
            paddingLeft: "8px",
          }}
        >
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: "inherit",
              fontWeight: "inherit",
              color: "inherit",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            Projects
          </button>
          <span>/</span>
          <span style={{ color: "var(--fgColor-default)" }}>
            {project.title}
          </span>
        </div>

        <div>
          <ProjectFieldsContainer projectId={project.id} />
            <div className={projectStyles.footer}>
              <Button
                onClick={() => handleRemoveProject(project.id)}
                variant="danger"
                size="small"
                block
              >
                Remove from project
              </Button>

              <IconButton
                onClick={() => handleRemoveProject(project.id)}
                size="small" icon={ArrowUpRight} aria-label={'Go to project'} 
                tooltip='Go to project'
              />
            </div>
        </div>
      </div>
    );
  };

  return (
    <div {...containerProps} className={containerProps.className}>
      {viewMode === 'list' ? renderListView() : renderDetailView()}
    </div>
  );
}
