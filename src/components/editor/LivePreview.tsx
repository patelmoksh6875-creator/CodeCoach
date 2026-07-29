import React, { useEffect, useState } from 'react';
import { FileMap, SandboxConsoleMessage } from '../../types/project';
import { createSandboxBundle } from '../../lib/utils/sandbox';

interface LivePreviewProps {
  files: FileMap;
  onConsoleMessage?: (msg: SandboxConsoleMessage) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ files, onConsoleMessage }) => {
  const [srcDoc, setSrcDoc] = useState<string>('');

  useEffect(() => {
    const bundle = createSandboxBundle(files);
    setSrcDoc(bundle);
  }, [files]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SANDBOX_CONSOLE' && onConsoleMessage) {
        onConsoleMessage(event.data.payload as SandboxConsoleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleMessage]);

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-inner overflow-hidden border border-gray-200">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Live Preview
        </span>
        <div className="flex space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
        </div>
      </div>
      <iframe
        title="CodeCoach Live Output"
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="w-full h-full border-none bg-white"
      />
    </div>
  );
};