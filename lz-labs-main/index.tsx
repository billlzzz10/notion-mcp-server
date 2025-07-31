import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ProjectProvider } from './src/contexts/ProjectContext';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ProjectProvider>
      <App />
    </ProjectProvider>
  </React.StrictMode>
);
