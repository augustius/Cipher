# 1A2B

@AGENTS.md

An offline, pass-and-play code-breaking game. `PRD.md` is the source of truth for the rules, screens, and scope. Read it before changing game behaviour. `designs/` contains the Stitch reference screens (HTML + screenshots) for visuals.

## Stack

React Native + Expo (TypeScript), Expo Router, NativeWind, Zustand, Jest.

## Conventions

- **Strict TypeScript.** Model unknowns with `unknown` plus narrowing, and model game states as discriminated unions (e.g. player status `active | solved | dnf`).
- **Pure core.** All game rules live in `src/game/` as pure functions with no React, Expo, or I/O imports: `scoreGuess`, `submitGuess`, `rankPlayers`, code validation. Screens call the core; the core never calls screens.
- **Test the core first.** Every rule in `src/game/` has Jest tests. The PRD §2.3 acceptance table is a required test case. Write the failing test before the rule.
- **One serializable store.** The whole match lives in a single Zustand store of plain JSON data (no class instances, no functions). It is saved after every change, so resume (PRD Screen 1) is just a rehydrate.
- **One file per screen** under `src/app/` (Expo Router): Lobby, Setup, Game, Results. The Handoff screen is a shared component in `src/components/`.
- **Styling with NativeWind classes only.** The Obsidian palette from PRD §4 is defined once in `src/theme/colors.js`, which feeds the Tailwind tokens. Components use token classes (`bg-surface`, `text-match`); props that need a raw color (icons, `placeholderTextColor`) import `@/theme/colors`. Hex values live only in that file.
- **Offline by construction.** Sounds live in `assets/sounds/`; fonts and icons come from packages that ship their files. Every dependency must work with zero network access.
- **Function components and hooks.**

## Code structure

Write for a human reader first.

- **One logical step per block.** Separate each logical step (guard, calculation, state update, return) from the next with a new line.
- **Short lines.** Lines are at most 100 characters. Break a long expression or condition into named intermediate variables, so each line says one thing.
- **Small files.** Files are at most 400 lines. When a file approaches the limit, split it by responsibility (e.g. move helpers into their own module).
- **Readable names over comments.** Name variables and functions for what they mean (`remainingPlayers`, `isCodeValid`). Add a comment only to explain *why*.
- **Enforced by tooling.** Prettier `printWidth: 100` and ESLint `max-lines: 400` and `max-len: 100`.
