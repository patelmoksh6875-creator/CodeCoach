import React from 'react';
import { FileMap } from '../../types/project';

interface FileExplorerProps {
  files: FileMap;
  activeFileName: string;
  onSelectFile: (fileName: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileName,
  onSelectFile,
}) => {
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.html')) return '🌐';
    if (fileName.endsWith('.css')) return '🎨';
    if (fileName.endsWith('.js')) return '⚡';
    return '📄';
  };

  return (
    <div className="w-56 bg-slate-900 text-slate-300 h-full flex flex-col border-r border-slate-800">
      <div className="p-3 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
        Files
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Object.keys(files).map((fileName) => {
          const isActive = fileName === activeFileName;
          return (
            <button
              key={fileName}
              onClick={() => onSelectFile(fileName)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-600/30 text-indigo-400 font-medium'
                  : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <span>{getFileIcon(fileName)}</span>
              <span className="truncate">{fileName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};