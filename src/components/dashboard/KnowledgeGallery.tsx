import React from 'react';
import { BookOpen } from 'lucide-react';
import type { GalleryItem } from '../../types/knowledge';

interface KnowledgeGalleryProps {
  items: GalleryItem[];
}

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

/** Renders the Gallery tab: today's / earlier explained snippets. */
export function KnowledgeGallery({ items }: KnowledgeGalleryProps) {
  const today = items.filter((i) => isToday(i.timestamp));
  const earlier = items.filter((i) => !isToday(i.timestamp));

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <BookOpen className="mx-auto mb-3 text-neutral-700" size={32} />
        <p className="text-sm text-neutral-500">
          Nothing here yet. Highlight code in the Build tab to explain it — explanations you view get saved here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {today.length > 0 && <GallerySection title="Today" items={today} />}
      {earlier.length > 0 && <GallerySection title="Earlier" items={earlier} />}
    </div>
  );
}

function GallerySection({ title, items }: { title: string; items: GalleryItem[] }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
              <span>{item.projectTitle} — {item.fileName}</span>
              <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
            </div>
            <pre className="mb-2 overflow-x-auto rounded bg-black px-3 py-2 text-xs text-neutral-300">
              {item.codeSnippet}
            </pre>
            <p className="text-sm text-neutral-300">{item.explanation.purpose}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
