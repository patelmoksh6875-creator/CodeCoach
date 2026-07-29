import React from 'react';

interface CodeEditorProps {
  fileName: string;
  code: string;
  onChange: (value: string) => void;
  onExplainSelection?: (selectedText: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  fileName,
  code,
  onChange,
  onExplainSelection,
}) => {
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  const handleTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
    if (selectedText.trim().length > 0 && onExplainSelection) {
      onExplainSelection(selectedText.trim());
    }
  };

  return (
    <div className="flex-1 h-full bg-slate-950 flex flex-col font-mono text-sm relative">
      <div className="bg-slate-900 text-slate-400 px-4 py-2 border-b border-slate-800 text-xs flex justify-between items-center">
        <span>{fileName}</span>
        <span className="text-slate-600">Select text to Explain</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="w-12 bg-slate-950 text-slate-600 text-right pr-3 py-3 select-none border-r border-slate-900 leading-6 text-xs">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Editor Area */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleTextSelect}
          spellCheck={false}
          className="flex-1 bg-transparent text-slate-200 p-3 resize-none outline-none leading-6 font-mono border-none focus:ring-0 overflow-y-auto"
        />
      </div>
    </div>
  );
};