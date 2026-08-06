import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

const STARTERS = ['A calculator', 'A to-do list', 'A tip splitter', 'A color picker'];

interface ProjectLauncherProps {
  onGenerate: (idea: string) => void;
  isGenerating: boolean;
  error: string | null;
}

/** The "what do you want to build?" input + quick starters, over an animated gradient. */
export function ProjectLauncher({ onGenerate, isGenerating, error }: ProjectLauncherProps) {
  const [idea, setIdea] = useState('');

  const submit = () => {
    if (!idea.trim() || isGenerating) return;
    onGenerate(idea.trim());
  };

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-neutral-100">What do you want to build?</h1>
          <p className="text-sm text-neutral-400">
            Describe an app idea. CodeCoach generates it, then teaches you to read it.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-3 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="a calculator, a to-do list, a pomodoro timer..."
            rows={3}
            className="w-full resize-none bg-transparent text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              onClick={submit}
              disabled={isGenerating || !idea.trim()}
              className="flex items-center gap-2 rounded bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-900 hover:bg-white disabled:opacity-40"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isGenerating ? 'Generating…' : 'Build it'}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => setIdea(s)}
              className="rounded-full border border-neutral-800 bg-neutral-950/60 px-3 py-1 text-xs text-neutral-400 backdrop-blur-sm hover:border-neutral-600 hover:text-neutral-200"
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/** Slow-drifting gradient blobs behind the launcher card. Pure CSS keyframe motion —
 *  cheap, no JS animation loop, respects prefers-reduced-motion via the animation
 *  being purely decorative (nothing depends on it for layout/comprehension). */
function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0">
      <div className="absolute inset-0 bg-neutral-950" />
      <div className="cc-blob cc-blob-a" />
      <div className="cc-blob cc-blob-b" />
      <div className="cc-blob cc-blob-c" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,11,0.6)_70%)]" />
      <style>{`
        .cc-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(70px);
          opacity: 0.35;
          will-change: transform;
        }
        .cc-blob-a {
          width: 32rem; height: 32rem;
          top: -8rem; left: 10%;
          background: radial-gradient(circle, #3b82f6, transparent 70%);
          animation: cc-drift-a 22s ease-in-out infinite;
        }
        .cc-blob-b {
          width: 26rem; height: 26rem;
          bottom: -6rem; right: 8%;
          background: radial-gradient(circle, #f59e0b, transparent 70%);
          animation: cc-drift-b 26s ease-in-out infinite;
        }
        .cc-blob-c {
          width: 22rem; height: 22rem;
          top: 30%; right: 30%;
          background: radial-gradient(circle, #a855f7, transparent 70%);
          animation: cc-drift-c 30s ease-in-out infinite;
        }
        @keyframes cc-drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4rem, 3rem) scale(1.1); }
        }
        @keyframes cc-drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-3rem, -2rem) scale(1.15); }
        }
        @keyframes cc-drift-c {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-2rem, 4rem) scale(0.9); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cc-blob { animation: none; }
        }
      `}</style>
    </div>
  );
}
