# CodeCoach — Project Handoff

This doc reflects the **actual current state of the repo** as of the class-based rebuild
merged into `main`. It replaces all prior handoff docs — earlier versions described a v2
redesign (framer-motion shared-layout transitions, a specific v1/v2 history) that turned
out not to match what was actually in GitHub; this doc only describes what's really here.

## 1. What this project is

CodeCoach is a web app where you type what you want to build ("a calculator", "a to-do
list"), an AI generates a small working React app, and you learn by *interacting* with
that code — highlighting lines to get them explained, editing code and getting live
feedback on what changed, testing your understanding with predict-before-you-run
quizzes, and getting guided (not handed-to-you) hints when you want to add a feature
yourself.

Personal learning/portfolio project — evaluate on whether the build works and is
well-crafted, not on market fit.

## 2. Tech stack

- Vite + React 18 + TypeScript
- Tailwind CSS via CDN script + inline `tailwind.config` in `index.html` (no build-step
  config file)
- `@codesandbox/sandpack-react` — in-browser code editor + live preview, compiles and
  runs the AI-generated app in an iframe, client-side, no backend
- `lucide-react` — icons, no emoji anywhere in the UI
- `groq-sdk` — calls Groq's OpenAI-compatible chat completion API using a
  **user-supplied API key stored in `localStorage`** (BYOK, no backend, no server-side
  key storage). `dangerouslyAllowBrowser: true` is intentional — this is a client-only
  app by design, not a bug to "fix" with a backend.

No backend. No database. No auth. Everything runs in the user's browser, including the
sandboxed AI-generated app inside Sandpack.

## 3. Architecture

The app is built around a **class-based service layer** (`src/core/`) that owns all
AI-calling and business logic, kept separate from the React layer (hooks + components),
which is purely state/rendering glue.

```
src/
  App.tsx                      — top nav (Build / Gallery tabs), owns useLearningLog
  main.tsx                     — entry point

  core/                        — the service layer. One class per responsibility.
    AIService.ts                — wraps groq-sdk: owns the BYOK key (localStorage),
                                   exposes completeJSON<T>(systemPrompt, userPrompt).
                                   Throws MissingApiKeyError / AIRequestError —
                                   callers surface these, never swallow them.
    ProjectGenerator.ts          — idea (string) -> GeneratedProject via AI
    MentorEngine.ts              — explainSnippet, generateDebugHints,
                                   createBreakChallenge, createGuidedBuildPlan
    LiveEditAnalyzer.ts          — pure logic (no AI call): diffs two versions of a
                                   file's contents and classifies the edit into
                                   deletion / modification / incomplete-addition
    LearningLog.ts               — in-session activity log + persisted Gallery
                                   (localStorage key `codecoach_gallery`) +
                                   AI-generated session summaries
    services.ts                  — singleton instances of all of the above, shared
                                   across the app (`import { services } from
                                   'core/services'`)

  prompts/
    prompts.ts                   — every AI system prompt lives here. Each one is
                                   written to return JSON matching a specific
                                   TypeScript type in types/ exactly — keep these in
                                   sync if you touch either side.

  hooks/
    useLiveCoach.ts               — React-facing glue over MentorEngine +
                                   LiveEditAnalyzer + LearningLog: owns the coach's
                                   intervention feed and every action that adds to it
    useLearningLog.ts             — React-facing glue over LearningLog for the
                                   Gallery tab + end-of-session summary

  pages/
    Dashboard.tsx                 — the whole "Build" experience: ProjectLauncher ->
                                   Workspace. Workspace wraps Sandpack's
                                   SandpackProvider; MentorWorkspace (inside the
                                   provider) wires the editor, live-edit monitor,
                                   highlight-to-explain, error hints, break mode,
                                   and guided build.

  components/
    dashboard/
      ProjectLauncher.tsx          — "what do you want to build?" input + starters
      KnowledgeGallery.tsx         — Gallery tab: today / earlier explained snippets
      SessionSummary.tsx           — end-of-session AI-generated summary modal
    coach/
      CoachPanel.tsx               — right-hand dock: intervention feed, Break Mode
                                   trigger, guided-build input
      HintSystem.tsx               — generic ProgressiveReveal component (click
                                   through steps one at a time; the answer is gated
                                   behind having stepped through all of them).
                                   Reused for BOTH debug hints and guided-build steps.
      ExplainDrawer.tsx            — non-blocking slide-in drawer (not a modal)
                                   showing a highlighted snippet's explanation
      BreakMode.tsx                — "predict what happens if you change X" quiz
    common/
      ApiKeyModal.tsx              — BYOK Groq key entry

  types/
    coach.ts                       — ExplanationResult, HintSequence,
                                   BreakModeChallenge, GuidedBuildStep,
                                   GuidedBuildPlan, LiveEditFeedback,
                                   CoachIntervention
    knowledge.ts                    — SessionActivity, SessionSummaryData, GalleryItem
    project.ts                      — GeneratedProject, FileMap
```

## 4. Design system

- Dark canvas (`neutral-950`/`neutral-900`/`neutral-800` Tailwind scale), 1px hairline
  borders, off-white text. No indigo/purple/gradient "generic AI tool" look.
  Blocky corners (3–6px radius), not rounded bubbles.
- `lucide-react` icons only — no emoji anywhere in the UI.
- Explanations render in a non-blocking slide-in drawer (`ExplainDrawer`), not a modal
  that blocks the screen.
- Debug hints and the guided-build plan share one UI component (`ProgressiveReveal` in
  `HintSystem.tsx`) — click through steps one at a time; the final answer/solution is
  gated behind stepping through every hint first.
- There is currently **no** shared-layout page transition (e.g. framer-motion) — the
  generator card simply swaps for the fullscreen IDE. A prior handoff document
  described a framer-motion signature transition as "already built and must not be
  touched"; that code never actually existed in this repo, so there's nothing to
  preserve there. Worth adding as a future enhancement, not a regression to fix.

## 5. Known-fixed issues (for context — don't reintroduce these)

- **Live preview rendering black/blank**: root cause was the AI project-generation
  prompt not requiring an explicit `import React` (and hook imports) — Sandpack's
  `react` template runs a real esbuild bundler, not a global-script runtime, so
  unimported `React`/`useState` usage is a hard compile error, not a soft failure.
  Fixed in `prompts/prompts.ts` (`PROJECT_GENERATOR_SYSTEM_PROMPT`). Also removed a
  `recompileMode: 'delayed'` Sandpack option that required a manual "Run" click on
  first load — verified live in a browser with a hardcoded test project.
- **Live-edit monitor producing no feedback on ordinary edits**: the old logic only
  had two buckets (pure deletion, incomplete addition) and silently dropped the most
  common edit shape — changing a value or renaming a variable (removes old text AND
  adds new, syntactically-complete text in the same window). `LiveEditAnalyzer` now
  has a third `modification` bucket, and checks bracket-balance across the whole file
  (stripping strings/comments first) instead of a per-line regex. Verified with direct
  test cases (deletion / complete addition / incomplete addition / modification /
  line-rewrite).
- **Highlight-to-explain never firing**: verified end-to-end against a real Sandpack
  editor — `selectionchange` fires, the `editorRef.current.contains(anchorNode)`
  containment check passes for real selections inside CodeMirror, and AI-call failures
  now surface visibly (the API-key modal, or a coach-panel message) instead of only
  `console.error`.
- **Guided "add a feature" mode didn't exist**: now implemented —
  `MentorEngine.createGuidedBuildPlan` + `GuidedBuildPlan`/`GuidedBuildStep` types,
  wired through `useLiveCoach.requestGuidedBuild`, rendered with the same
  `ProgressiveReveal` component debug hints use.

## 6. Constraints going forward

- **No backend.** Stays client-only, BYOK Groq key in localStorage.
- **Every AI prompt's JSON output must exactly match the TypeScript type it's parsed
  into.** When adding or changing any prompt in `prompts/prompts.ts`, double-check the
  corresponding type in `types/coach.ts` / `types/knowledge.ts` / `types/project.ts`
  field-by-field. This exact mismatch was the root cause of nearly every silent AI
  failure in this project's history.
- **A clean `tsc --noEmit` and `vite build` are necessary but not sufficient.** Verify
  any behavioral change by actually running the dev server and testing the real
  interaction in a browser — this project has repeatedly shipped "compiles clean" code
  that didn't work at runtime.
- No live Groq API key has been used to test full AI *responses* yet (only that every
  AI-calling path correctly reaches the API-key-required flow instead of failing
  silently) — treat actual model output quality/shape as unverified until tested with
  a real key.
- Deployed to Vercel from the `main` branch (project: `moksh-personal/code-coach`).
  GitHub repo: `patelmoksh6875-creator/CodeCoach`.
