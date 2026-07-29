export interface ProjectFile {
  name: string;
  language: 'html' | 'css' | 'javascript' | 'json';
  content: string;
}

export interface FileMap {
  [fileName: string]: ProjectFile;
}

export interface GeneratedProject {
  projectName: string;
  description: string;
  entryPoint: string;
  files: FileMap;
}

export interface SandboxConsoleMessage {
  type: 'log' | 'error' | 'warn';
  message: string;
  lineNumber?: number;
  colNumber?: number;
}