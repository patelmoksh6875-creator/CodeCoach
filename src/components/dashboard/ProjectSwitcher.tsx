import React, { useRef, useState } from 'react';
import { FolderOpen, FolderUp, Trash2, ChevronDown } from 'lucide-react';
import type { SavedProjectRecord } from '../../core/ProjectStore';

interface ProjectSwitcherProps {
  savedProjects: SavedProjectRecord[];
  onSelect: (record: SavedProjectRecord) => void;
  onImportFolder: (fileList: FileList) => void;
  onDelete: (id: string) => void;
}

/** Dropdown for switching between saved (generated or imported) projects, and
 *  importing a folder from disk to browse/explain/edit like any generated project. */
export function ProjectSwitcher({ savedProjects, onSelect, onImportFolder, onDelete }: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded border border-neutral-800 px-2.5 py-1.5 text-xs text-neutral-300 hover:border-neutral-600"
      >
        <FolderOpen size={13} />
        Projects
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded border border-neutral-700 bg-neutral-900 shadow-2xl">
          <div className="max-h-64 overflow-y-auto p-1.5">
            {savedProjects.length === 0 && (
              <p className="px-2 py-3 text-xs text-neutral-500">No saved projects yet.</p>
            )}
            {savedProjects.map((record) => (
              <div
                key={record.id}
                className="group flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-neutral-800"
              >
                <button
                  onClick={() => {
                    onSelect(record);
                    setOpen(false);
                  }}
                  className="flex-1 truncate text-left text-neutral-200"
                >
                  <span className="font-medium">{record.project.title}</span>
                  <span className="ml-1.5 text-neutral-500">
                    {record.source === 'imported' ? 'imported' : 'generated'}
                  </span>
                </button>
                <button
                  onClick={() => onDelete(record.id)}
                  className="ml-2 shrink-0 text-neutral-600 opacity-0 hover:text-red-400 group-hover:opacity-100"
                  aria-label="Delete project"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-800 p-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              <FolderUp size={13} />
              Import a folder from disk
            </button>
            <input
              ref={fileInputRef}
              type="file"
              // @ts-expect-error non-standard attributes for folder selection
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onImportFolder(e.target.files);
                  setOpen(false);
                }
                e.target.value = '';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
