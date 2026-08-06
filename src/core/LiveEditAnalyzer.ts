import type { LiveEditFeedback } from '../types/coach';

const BRACKET_PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
const CLOSERS = new Set(Object.values(BRACKET_PAIRS));

/**
 * Classifies an edit to a file (previous full contents -> next full contents) into one of
 * three buckets and produces feedback for it. This replaces the old two-bucket model
 * (pure-deletion / incomplete-addition) that silently dropped the most common edit shape:
 * a line changed in place (old text removed AND new, syntactically-complete text added in
 * the same debounced window).
 */
export class LiveEditAnalyzer {
  /** Returns null when there's nothing worth surfacing (e.g. no change, or a no-op diff). */
  analyze(previous: string, next: string): LiveEditFeedback | null {
    if (previous === next) return null;

    const prevLines = previous.split('\n');
    const nextLines = next.split('\n');

    const removed = prevLines.filter((l) => !nextLines.includes(l));
    const added = nextLines.filter((l) => !prevLines.includes(l));

    if (removed.length === 0 && added.length === 0) return null;

    // Whole-file bracket balance is a much more reliable "still mid-edit" signal than a
    // per-line regex: it catches multi-line incomplete constructs a per-line check would miss,
    // and it won't false-positive on a single complete line that merely *starts* a block.
    if (!this.isBracketBalanced(next)) {
      return {
        kind: 'incomplete-addition',
        message:
          "Looks like you're mid-edit — there's an unclosed bracket, paren, or brace somewhere in this file. Keep going, the coach will check back once it balances.",
      };
    }

    if (removed.length > 0 && added.length === 0) {
      return {
        kind: 'deletion',
        message: `You removed ${removed.length === 1 ? 'a line' : `${removed.length} lines`}. Make sure nothing else in the file still refers to what used to be there.`,
      };
    }

    if (removed.length > 0 && added.length > 0) {
      return {
        kind: 'modification',
        message: `You changed ${removed.length === 1 ? 'a line' : `${removed.length} lines`}. Re-run the preview and check the change did what you expected.`,
      };
    }

    // pure addition, and the file is bracket-balanced -> nothing incomplete to flag
    return null;
  }

  private isBracketBalanced(code: string): boolean {
    const stack: string[] = [];
    // strip string/template literals and comments crudely so brackets inside them don't
    // throw off the count; this is a heuristic, not a parser.
    const cleaned = code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/`(?:\\.|[^`\\])*`/g, '')
      .replace(/"(?:\\.|[^"\\])*"/g, '')
      .replace(/'(?:\\.|[^'\\])*'/g, '');

    for (const ch of cleaned) {
      if (ch in BRACKET_PAIRS) {
        stack.push(BRACKET_PAIRS[ch]);
      } else if (CLOSERS.has(ch)) {
        if (stack.pop() !== ch) return false;
      }
    }
    return stack.length === 0;
  }
}
