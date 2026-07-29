import { useState, useCallback } from 'react';
import { FileMap, GeneratedProject } from '../types/project';

export function useProjectState(initialProject?: GeneratedProject) {
  const [project, setProject] = useState<GeneratedProject | null>(initialProject || null);
  const [activeFileName, setActiveFileName] = useState<string>('app.js');

  const setFullProject = useCallback((newProject: GeneratedProject) => {
    setProject(newProject);
    if (newProject.files['app.js']) {
      setActiveFileName('app.js');
    } else {
      setActiveFileName(Object.keys(newProject.files)[0] || 'index.html');
    }
  }, []);

  const updateFileContent = useCallback((fileName: string, content: string) => {
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        files: {
          ...prev.files,
          [fileName]: {
            ...prev.files[fileName],
            content,
          },
        },
      };
    });
  }, []);

  const activeFile = project?.files[activeFileName] || null;

  return {
    project,
    files: project?.files || ({} as FileMap),
    activeFileName,
    activeFile,
    setActiveFileName,
    updateFileContent,
    setFullProject,
  };
}