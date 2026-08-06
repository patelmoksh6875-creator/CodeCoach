# CodeCoach — Context Handoff for Claude Code

This doc has two parts: **(1) full context** on what this project is and where it's stuck, and **(2) a ready-to-paste prompt** for Claude Code at the bottom. Give Claude Code this whole file as context (e.g. drop it in the repo root as `HANDOFF.md` and reference it), then use the prompt section to kick off the rebuild.

---

## 1. What this project is

CodeCoach is a web app where you type what you want to build ("a calculator", "a to-do list"), an AI generates a small working React app, and then you learn by *interacting* with that code — highlighting lines to get them explained, editing code and getting live feedback on what changed, and (a feature that still needs to be built) telling the AI what you want to add and getting guided hints to write it yourself instead of the AI just writing it for you.

The target user is someone who can't read code fluently yet but has AI-generated or AI-assisted projects they want to actually understand — the pitch is "AI writes code for everyone now; almost nobody can read it. This teaches you to read it by making you highlight, break, and rebuild real running code."

This is a **personal learning/portfolio project**, not a startup pitch — evaluate it purely on whether the build works and is well-crafted, not on market fit or business potential.

## 2. History (why the code looks the way it does)

- **v1**: built with Gemini. Had ~50% dead code (a whole second unused implementation) and every single AI prompt returned a JSON shape that didn't match what the TypeScript code parsed it into — meaning most AI features were silently broken from day one, even though the app compiled fine.
- **v2 (Claude, prior session)**: fixed the prompt/type mismatches, deleted the dead code, merged two parallel systems into one, and did a full visual redesign (see Section 4 — **do not redo this, it's considered done and correct**). Verified with `tsc --noEmit` and `vite build`, both clean.
- **Now**: the redesigned v2 app compiles and builds cleanly, but real-browser testing surfaced that several features don't actually work at runtime. Type-checking and building clean was not sufficient proof the features worked — **this is the central lesson for the rebuild: verify in an actual running browser, not just via a clean build.**

## 3. Tech stack

- Vite + React 18 + TypeScript
- Tailwind CSS (via CDN script + inline `tailwind.config` in `index.html` — not a build-step config file)
- `@codesandbox/sandpack-react` — provides the in-browser code editor + live preview (compiles and runs the AI-generated app in an iframe, client-side, no backend)
- `framer-motion` — animations, notably a shared-layout expand from the generator card to the fullscreen IDE
- `lucide-react` — icons (deliberately no emoji anywhere in the UI)
- `@fontsource/inter` — self-hosted Inter font
- `groq-sdk` — calls Groq's OpenAI-compatible chat completion API, using a **user-supplied API key stored in `localStorage`** (BYOK — bring your own key, no backend, no server-side key storage). `dangerouslyAllowBrowser: true` is set because this is intentionally a client-only app. This is a known tradeoff (the key is visible in devtools), not a bug — don't "fix" it by adding a backend unless asked.

No backend. No database. No auth. Everything runs in the user's browser, including the sandboxed AI-generated app inside Sandpack.

## 4. Current architecture (as of the last working build)

```
src/
  App.tsx                          — top nav (Build / Gallery tabs), owns useLearningLog
  main.tsx                         — entry point, loads Inter font weights

  pages/
    Dashboard.tsx                  — the whole "Build" experience: launcher →
                                      shared-layout expand → fullscreen IDE.
                                      Contains MentorWorkspace (lives inside
                                      SandpackProvider) which wires the editor,
                                      the mentor panel, explain-on-highlight,
                                      the live edit monitor, and the floating preview.

  components/
    dashboard/
      ProjectLauncher.tsx           — the "what do you want to build?" input + quick starters
      SessionSummary.tsx            — end-of-session AI-generated summary modal
      KnowledgeGallery.tsx          — renders the Gallery tab (today / earlier explained snippets)
    coach/
      CoachPanel.tsx                — right-hand dock: feed of AI interventions + Break Mode trigger
      HintSystem.tsx                — 4-step progressive hint reveal (used for error hints)
      ExplainPanel.tsx              — slide-in drawer (NOT a modal) showing a highlighted
                                      snippet's explanation: purpose, inputs/outputs,
                                      where it's used, common mistakes, language + layer tags
      BreakMode.tsx                 — "predict what happens if you change X" quiz modal
    preview/
      FloatingPreview.tsx           — collapsible bottom-right live preview widget
                                      (thumbnail ↔ quarter-screen), wraps Sandpack's
                                      <SandpackPreview>

  hooks/
    useLiveCoach.ts                 — the core interaction hook: manages AI interventions,
                                      explain-on-highlight state, break mode state, error-hint
                                      state, AND the live edit monitor (watchEdit/primeEditSnapshot)
    useLearningLog.ts                — session activity log + the Gallery's persisted items
                                      (localStorage key `codecoach_gallery`) + end-of-session summary

  lib/
    ai/
      client.ts                     — thin wrapper around groq-sdk, `callAI(systemPrompt, userPrompt, config)`
      prompts.ts                    — EVERY AI system prompt. Each one is written to return JSON
                                      matching a specific TypeScript type exactly — keep these in
                                      sync if you touch either side.
    engine/
      generator.ts                  — turns a user prompt into a GeneratedProject (title,
                                      description, files) via PROJECT_GENERATOR_SYSTEM_PROMPT.
                                      Normalizes AI output into Sandpack's file-path format.
      mentor.ts                     — explainCode(), generateDebugHints(), createBreakModeChallenge()
      knowledge.ts                  — generateSessionSummary()
      liveEdit.ts                   — diffCode(), looksIncomplete(), explainDeletion(),
                                      hintIncompleteAddition() — THIS IS THE BROKEN LIVE-EDIT LOGIC,
                                      see Section 6.

  types/
    coach.ts                        — ExplainRequest, ExplanationResult, HintSequence,
                                      BreakModeChallenge, LiveEditFeedback, CoachIntervention
    knowledge.ts                    — SessionActivity, SessionSummaryData, GalleryItem
    project.ts                      — GeneratedProject
```

## 5. Design system — DO NOT CHANGE

The user has explicitly said the UI and dashboard are correct as-is. **Do not touch visual/layout code.** This section exists so Claude Code understands what "correct" looks like and doesn't accidentally regress it while fixing logic bugs nearby.

- Dark canvas (`#0A0A0B`), neutral surfaces (`#111113` / `#18181B` / `#212124`), 1px hairline borders (`#28282C`), off-white ink text (`#F2F1ED` / dimmer variants). No indigo/purple — that was deliberately removed as the "generic AI tool" tell.
- One light neutral accent color (`#E9E7DF`, a bone/paper tone) used sparingly for primary actions only.
- Blocky corners (3–6px radius), not rounded bubbles.
- Inter only, self-hosted, no external font CDN calls.
- `lucide-react` icons only — **no emoji anywhere in the UI.**
- The generator card becomes the fullscreen IDE via a `framer-motion` `layoutId="workspace-shell"` shared-element transition — this is the signature interaction, keep it intact.
- Explanations render in a non-blocking slide-in drawer (`ExplainPanel`), not a modal that blocks the screen.
- The live preview is a floating, collapsible widget (thumbnail bottom-right ↔ quarter-screen), not a fixed always-on-screen third column.

If a logic fix requires touching a component in Section 4 that also contains visual markup, change only the logic (state, effects, event handling, function calls) and leave className/JSX structure/colors untouched unless there's no way to fix the bug without it.

## 6. Known broken features — what actually needs fixing

These were reported after real browser testing (not just a clean build), so treat "builds clean" as necessary but not sufficient for any fix here. **Verify every fix by actually running the app and testing the interaction, not just by re-running `tsc`.**

### 6.1 — Live preview renders black
When the AI generates a project, the preview panel (`FloatingPreview.tsx` → `<SandpackPreview>`) shows solid black instead of the running app. This happened in v1 too (worth knowing it's a recurring issue, not a one-off regression). Likely areas to investigate, in rough order of likelihood:
- Sandpack's bundler runs in a separate iframe that by default loads from CodeSandbox's own hosted bundler service over the network — check the browser's Network/Console tab for blocked or failed requests to that bundler when the preview is supposed to render. If requests are blocked (CSP, ad blocker, offline), the preview iframe will render blank/black with no obvious error in your own code.
- Check whether `theme="dark"` on `SandpackProvider` is somehow leaking into the actual preview iframe's rendered document (it shouldn't — the preview iframe should be an unthemed instance of the running app — but confirm this isn't an actual Sandpack version quirk).
- Confirm the AI-generated `App.tsx` files actually render visible content with a visible background/text color — since the generation prompt forces inline-styles-only with no UI library, check for generated apps that set a dark inline background with default (unset/black-on-black) text color, which would look identical to "the preview is broken" but actually be a generation-prompt issue.
- Test with a trivial known-good Sandpack example (hardcoded files, no AI generation involved) to isolate whether this is a Sandpack/environment issue or specific to AI-generated content.

### 6.2 — Highlighting code does not trigger an explanation
`Dashboard.tsx`'s `MentorWorkspace` listens for `document`'s `selectionchange` event, checks the selection is inside `editorRef`, debounces ~450ms, then calls `requestExplanation`. This was never verified against a live Sandpack editor with a real API key — only that it type-checks. Investigate:
- Confirm `selectionchange` actually fires and reaches the handler when selecting text inside Sandpack's CodeMirror editor (add a temporary `console.log` at the top of the handler to confirm firing before debugging further downstream).
- Confirm `editorRef.current.contains(selection.anchorNode)` actually returns true for a real selection inside CodeMirror — if CodeMirror renders its content in a way that puts the selection anchor outside the ref'd container (e.g. via a portal, or if `editorRef` is attached to the wrong DOM node), this check will always fail and silently swallow every explain attempt.
- Confirm the Groq API call itself succeeds (check Network tab for the request/response) once the above is ruled out — if this is instead an API key/auth issue, the failure would currently be swallowed silently (`requestExplanation` catches and logs to `console.error`, doesn't surface anything to the UI) — consider surfacing AI-call failures visibly instead of only console-logging them, so future issues like this aren't invisible.

### 6.3 — Editing code produces no live feedback (this one has a confirmed root cause, not just a hypothesis)
This is a real logic gap in `lib/engine/liveEdit.ts`, confirmed by reading the code, not just a runtime mystery:

`watchEdit` only produces feedback in two narrow cases:
1. Lines were **removed and nothing was added** (a pure deletion).
2. Lines were **added and at least one of them fails a narrow "looks incomplete" regex check** (unbalanced brackets, or the line ends in a dangling operator/keyword).

**Any ordinary edit that changes a line — the most common kind of edit — falls into neither bucket.** Changing a value, renaming a variable, rewriting a whole line: all of these remove an old line's text AND add new (syntactically complete) text in the same debounced window, so `removedLines.length > 0 AND addedLines.length > 0` → falls into the "addition" branch → the new line is very likely syntactically complete → `looksIncomplete` returns false for it → **no feedback fires at all.** This matches the reported symptom exactly ("when I add or change anything I don't see any feedback even after waiting").

To actually fix this, the classification logic needs a third case: a **modification** (both removed and added lines present, not just a pure add or pure delete) should also produce feedback — e.g. explain what changed and why, not just handle pure-deletion and mid-typing-incomplete as the only two feedback-worthy states. The current two-bucket model was too narrow by design, not just buggy in execution.

Also worth reconsidering while fixing this: `looksIncomplete()` only checks the **first** matching incomplete line it finds via `.find()`, and its regex-based heuristic ("dangling operator/keyword at end of trimmed line") will miss a lot of genuinely incomplete code and false-positive on some genuinely complete code. A more reliable signal here would be worth exploring (e.g. actually checking bracket-balance across the whole file rather than per-line, or leaning on Sandpack's own compile error state as an additional signal) rather than trying to patch the regex further.

### 6.4 — Guided "add a feature" mode doesn't exist yet
This isn't a bug — it was scoped in the original brief and never built. The idea: instead of only generating a whole project or reacting to edits, let the learner type what they want to *add* (e.g. "add a reset button that clears the total"), and have the AI respond with **guided hints toward writing it themselves** — not working code handed to them. This should probably look like:
- A new input somewhere in the mentor panel (or a distinct mode) where the learner describes what they want to add.
- The AI responds with a step-by-step guided plan (similar spirit to the existing `HintSequence`/`HintSystem` progressive-reveal pattern already used for debugging — that pattern is proven and already has UI for it, so reusing that shape/interaction for "guided add" instead of inventing a new UI pattern is probably the right move) — hints that get progressively more specific, without ever just handing over the finished line unless the learner reaches the final step.
- This needs a new AI prompt (following the existing pattern in `prompts.ts` — every prompt has a JSON shape that must exactly match a TypeScript type) and a new type, e.g. `GuidedBuildStep` or similar, plus a new engine function in `lib/engine/`, wired through `useLiveCoach.ts` the same way `triggerBreakMode`/`requestExplanation` are.
- This is the one item in this list that's new construction rather than a fix — design it consistently with the existing hint/intervention patterns rather than as a bolt-on.

## 7. Constraints for the rebuild

- **Do not change visual design, layout, colors, typography, or the shared-layout expand animation.** Section 5 is considered correct and finished.
- **Do not add a backend.** Stays client-only, BYOK Groq key in localStorage.
- **Every AI prompt's JSON output must exactly match the TypeScript type it's parsed into.** This exact mismatch was the root cause of nearly every silent failure in this project's history (see Section 2) — when adding or changing any prompt in `prompts.ts`, double-check the corresponding type in `types/coach.ts` or `types/knowledge.ts` field-by-field.
- **A clean `tsc --noEmit` and `vite build` are necessary but not sufficient.** Every fix in Section 6 must be verified by actually running the dev server and testing the real interaction in a browser (with a real Groq API key) before being considered done — this project has repeatedly shipped "compiles clean" code that didn't work at runtime.
- No shortcuts, no placeholder/stub implementations presented as finished, no claiming something works without having actually verified it runs.

---

## 2. Rebuild prompt — paste this into Claude Code

```
I'm rebuilding CodeCoach, an existing Vite + React + TypeScript project. Full context,
architecture, design system (which must NOT change), and a detailed breakdown of what's
currently broken and why are in HANDOFF.md in this repo root — read it in full before
doing anything else.

Do this in order:

1. Read HANDOFF.md completely, then explore the actual current codebase yourself
   (don't rely solely on the doc's file listing — confirm it against what's really there).

2. Set up the project locally (npm install) and get the dev server running before
   changing any code, so you have a real browser baseline to compare against.

3. Fix the four issues in Section 6 of HANDOFF.md, in this order:
   a. The live-edit monitor logic gap (Section 6.3) — this one has a confirmed root
      cause in the code itself, start here since it doesn't require live debugging
      to understand.
   b. The black preview panel (Section 6.1) — investigate using the browser's Network
      and Console tabs as described, don't guess-and-check blindly.
   c. Highlight-to-explain not firing (Section 6.2) — instrument with logging to find
      exactly where the chain breaks (selection detection vs. DOM containment check
      vs. the actual API call) before changing code.
   d. Build the guided "add a feature" mode described in Section 6.4, reusing the
      existing progressive-hint UI pattern rather than inventing a new one.

4. Do NOT modify anything under Section 5 (design system) — no colors, spacing,
   layout, animation, or component structure changes unless a bug fix is genuinely
   impossible without it, and if so, explain exactly what and why before proceeding.

5. For every fix, verify it by actually running the app in a browser and testing the
   real interaction — a clean `tsc --noEmit` or `vite build` is not sufficient
   evidence that something works, per Section 7's explicit constraint. Use a real
   Groq API key for anything that calls the AI.

6. When you believe something is fixed, describe exactly how you verified it
   (what you clicked, what you saw, what the network/console showed) rather than
   just asserting it works.

Ask me for a Groq API key if you need one to test AI-calling features.
```
