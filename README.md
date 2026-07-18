# مُركّب البرومبت | Prompt Composer

A premium, bilingual (Arabic-first / English) productivity tool that turns a short interview
into professional, model-optimized prompts — no prompt-writing skill required.

Pick a project type (Design, Game, Video, Programming, Marketing, Image, Website, Writing, Other),
answer a short sequence of relevant questions, then generate optimized prompts for:

- Claude
- ChatGPT
- Gemini
- Flux
- Midjourney
- Stable Diffusion

## Features

- Step-by-step interview instead of writing one giant prompt
- Per-model prompt generation, tuned to each model's conventions
  (Claude/ChatGPT/Gemini get structured, role-based prompts; Midjourney/Stable
  Diffusion/Flux get tag- or description-based visual prompts with parameters)
- Prompt quality score, missing-information detector, and AI suggestions
- Prompt history and favorites (stored locally in the browser)
- One-click copy per generated prompt
- Ready-made templates to start fast
- Arabic (RTL) as the primary language, with a full English (LTR) mode
- Minimal, premium dark-mode-first UI, fully responsive

## Stack

React + TypeScript + Vite + Tailwind CSS v4. No backend — all data (history/favorites,
language, theme) is persisted in `localStorage`.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # oxlint
```
