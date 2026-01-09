import { AgentIcon } from '@primer/octicons-react';

export interface AgentSessionProgressCardProps {
  title: string;
  subtitle: string;
  description: string;
  progress: number;
  status: 'running' | 'completed' | 'failed';
  avatar?: string;
}

export function AgentSessionProgressCard({
  title,
  subtitle,
  description,
  progress,
  status,
  avatar,
}: AgentSessionProgressCardProps) {
  const getProgressColor = () => {
    switch (status) {
      case 'completed':
        return 'var(--fgColor-success, #1a7f37)';
      case 'failed':
        return 'var(--fgColor-danger, #cf222e)';
      case 'running':
      default:
        return 'var(--fgColor-accent, #0969da)';
    }
  };

  return (
    <div
      style={{
        border: 'var(--borderWidth-thin, 1px) solid var(--borderColor-default, #d0d7de)',
        borderRadius: 'var(--borderRadius-medium, 6px)',
        padding: 'var(--base-size-12, 0.75rem)',
        backgroundColor: 'var(--bgColor-muted, #f6f8fa)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--base-size-8, 0.5rem)',
          marginBottom: 'var(--base-size-8, 0.5rem)',
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt=""
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />
        ) : (
          <AgentIcon size={16} />
        )}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 'var(--base-text-weight-medium, 500)',
              fontSize: 'var(--text-body-size-small, 0.875rem)',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 'var(--text-body-size-small, 0.75rem)',
              color: 'var(--fgColor-muted, #656d76)',
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: 'var(--text-body-size-small, 0.75rem)',
          color: 'var(--fgColor-muted, #656d76)',
          marginBottom: 'var(--base-size-8, 0.5rem)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {description}
      </div>
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--borderColor-default, #d0d7de)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: getProgressColor(),
            transition: 'width 0.3s',
          }}
        />
      </div>
    </div>
  );
}
