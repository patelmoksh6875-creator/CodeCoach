import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SandpackPreview } from '@codesandbox/sandpack-react';
import { Maximize2, Minimize2, MonitorPlay } from 'lucide-react';

const COLLAPSED = { width: 260, height: 176 };
const EXPANDED = { width: 640, height: 480 };

/**
 * Collapsible floating live preview: a small thumbnail docked bottom-right by default,
 * expands to a larger panel on click with a spring animation. The underlying
 * <SandpackPreview> iframe stays mounted across both states so the running app never
 * remounts/resets when you expand or collapse it.
 */
export const FloatingPreview = React.memo(function FloatingPreview() {
  const [expanded, setExpanded] = useState(false);
  const size = expanded ? EXPANDED : COLLAPSED;

  return (
    <motion.div
      initial={false}
      animate={size}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="fixed bottom-5 right-5 z-40 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-950 shadow-2xl"
      style={{ maxWidth: 'calc(100vw - 2.5rem)', maxHeight: 'calc(100vh - 2.5rem)' }}
    >
      <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
          <MonitorPlay size={13} />
          Live preview
        </span>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-neutral-400 hover:text-neutral-100"
          aria-label={expanded ? 'Collapse preview' : 'Expand preview'}
        >
          {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
      <div style={{ height: size.height - 33 }}>
        <SandpackPreview
          style={{ height: '100%' }}
          showNavigator={expanded}
          showRefreshButton={expanded}
          showOpenInCodeSandbox={false}
        />
      </div>
    </motion.div>
  );
});
