import React from 'react';

interface Project {
  id: string;
  name: string;
}

interface ProjectSelectorDropdownProps {
  projects: Project[];
  selectedProject?: Project;
  onSelectProject: (project: Project) => void;
}

const ProjectSelectorDropdown: React.FC<ProjectSelectorDropdownProps> = ({ 
  projects, 
  selectedProject, 
  onSelectProject 
}) => {
  return (
    <div className="relative">
      <select 
        title="Select Project"
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        value={selectedProject?.id || ''}
        onChange={(e) => {
          const project = projects.find(p => p.id === e.target.value);
          if (project) onSelectProject(project);
        }}
      >
        {projects.map(project => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProjectSelectorDropdown;
