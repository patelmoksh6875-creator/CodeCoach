import type { FileMap, GeneratedProject } from '../types/project';

const STORAGE_KEY = 'codecoach_projects';
const TEXT_FILE_EXTENSIONS = /\.(jsx?|tsx?|json|css|html|md|txt)$/i;
const ENTRY_CANDIDATES = [
  '/App.js', '/App.jsx', '/App.tsx',
  '/src/App.js', '/src/App.jsx', '/src/App.tsx',
  '/index.js', '/index.jsx', '/src/index.js',
];

export interface SavedProjectRecord {
  id: string;
  savedAt: number;
  source: 'generated' | 'imported';
  project: GeneratedProject;
}

/**
 * Persists both AI-generated and imported (uploaded) projects to localStorage so they
 * can be reopened later, and turns a browser FileList (from a folder picker) into a
 * GeneratedProject-shaped FileMap. Every project handled here — generated or imported
 * — is just a title/entryFile/FileMap, so the rest of the app (explain, live-edit,
 * coach) works on it identically regardless of where it came from.
 */
export class ProjectStore {
  list(): SavedProjectRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const records = raw ? (JSON.parse(raw) as SavedProjectRecord[]) : [];
      return records.sort((a, b) => b.savedAt - a.savedAt);
    } catch {
      return [];
    }
  }

  save(project: GeneratedProject, source: 'generated' | 'imported'): SavedProjectRecord {
    const record: SavedProjectRecord = {
      id: crypto.randomUUID(),
      savedAt: Date.now(),
      source,
      project,
    };
    const records = this.list();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return record;
  }

  remove(id: string): void {
    const records = this.list().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  /** Reads a FileList (e.g. from an <input webkitdirectory> folder picker) into a
   *  GeneratedProject. Skips binaries/images/node_modules; only text-like source files. */
  async importFromFileList(fileList: FileList, title: string): Promise<GeneratedProject> {
    const files: FileMap = {};
    const entries = Array.from(fileList).filter(
      (f) => TEXT_FILE_EXTENSIONS.test(f.name) && !f.webkitRelativePath.includes('node_modules/')
    );

    if (entries.length === 0) {
      throw new Error('No readable source files (.js/.jsx/.ts/.tsx/.json/.css/.html/.md) found in that folder.');
    }

    for (const file of entries) {
      const relative = file.webkitRelativePath || file.name;
      // strip the top-level folder name so paths are rooted at "/", matching Sandpack's format
      const withoutRoot = relative.split('/').slice(1).join('/');
      const path = '/' + (withoutRoot || file.name);
      files[path] = this.sanitizeForSandpack(await file.text());
    }

    return {
      title,
      description: `Imported from ${entries.length} file${entries.length === 1 ? '' : 's'}`,
      entryFile: this.guessEntryFile(files),
      files,
    };
  }

  private guessEntryFile(files: FileMap): string {
    for (const candidate of ENTRY_CANDIDATES) {
      if (files[candidate]) return candidate;
    }
    const firstSourceFile = Object.keys(files).find((p) => /\.(jsx?|tsx?)$/.test(p));
    return firstSourceFile ?? Object.keys(files)[0];
  }

  /**
   * Sandpack's default "react" template transpiles and runs files as plain scripts,
   * not real ES modules — so any `import.meta` reference (extremely common in
   * real-world Vite projects, e.g. `import.meta.env.VITE_*`, `import.meta.hot`,
   * `import.meta.url`) is a hard "Cannot use 'import.meta' outside a module" crash
   * at runtime, not a warning. Imported folders are exactly the case where this bites
   * (AI-generated projects never emit it, since the generation prompt forbids it).
   * Strip/stub it out so an imported real project can at least run inside the sandbox,
   * rather than crashing the whole preview on files that may not even be the active one.
   */
  private sanitizeForSandpack(source: string): string {
    return source
      .replace(/import\.meta\.env\.[A-Za-z_$][\w$]*/g, 'undefined')
      .replace(/import\.meta\.env/g, '({})')
      .replace(/import\.meta\.hot/g, 'undefined')
      .replace(/import\.meta\.url/g, '""')
      .replace(/import\.meta\.glob\([^)]*\)/g, '({})')
      .replace(/import\.meta/g, '({})');
  }
}
