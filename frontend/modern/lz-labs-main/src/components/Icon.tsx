import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 20, className = '' }) => {
  // Simple icon component - in a real app, you'd use a proper icon library
  const icons: Record<string, string> = {
    dashboard: '📊',
    notes: '📝',
    ai: '🤖',
    graph: '🔗',
    tasks: '✅',
    dictionary: '📚',
    lore: '🗂️',
    timer: '⏱️',
    structure: '🏗️',
    settings: '⚙️'
  };

  return (
    <span 
      className={`inline-block text-${size === 20 ? 'base' : size === 16 ? 'sm' : 'lg'} ${className}`}
      aria-label={`${name} icon`}
    >
      {icons[name] || '❓'}
    </span>
  );
};

export default Icon;
