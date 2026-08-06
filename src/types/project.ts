/** A single generated project file, keyed by Sandpack-style path (e.g. "/App.js"). */
export interface FileMap {
  [path: string]: string;
}

export interface GeneratedProject {
  title: string;
  description: string;
  /** Sandpack path of the file that should be open/active by default, e.g. "/App.js" */
  entryFile: string;
  files: FileMap;
}
