# Product Requirements Document (PRD) & Product Brief: **1A2B**

---

## 1. Executive Summary & Vision

**1A2B** is a distraction-free, offline pass-and-play numeric deduction mobile game for 2 to 4 local players, plus a Solo puzzle mode. Players crack each other's secret 4-digit codes (no repeated digits) through circular relay guessing and precise deductive feedback (`[M] Match` and `[F] Found`).

**1A2B** runs 100% offline on a single shared device. It has a focused, minimal, developer-grade aesthetic (Obsidian dark UI) with zero clutter: no account creation, no online matchmaking, no ads, no analytics, and no tab bars.

---

## 2. Core Game Rules & Mechanics

### 2.1 The Secret Code
- **Length**: Exactly 4 digits.
- **Constraints**: Unique digits `0–9`; leading zero allowed (`0123` is valid; `4419` is invalid).
- **Setup**: Entered privately by each player using a pass-and-play handoff (see Screen 2).

### 2.2 Guesses
- Same constraint as codes: 4 unique digits, leading zero allowed. A guess containing a repeated digit is rejected with a shake + warning.
- Resubmitting an exact previous guess is **allowed** with no hint or warning (it costs a turn).

### 2.3 Terminology & Clue System
Traditional "Bulls and Cows" terminology is replaced with:
- **`[M] Match`**: A guessed digit is in the code **and** in the correct position.
- **`[F] Found`**: A guessed digit is in the code but in the wrong position.
- **`0M 0F`**: None of the guessed digits are in the code.
- **`4M 0F`**: Code cracked.

**Acceptance examples** (code `1234`):

| Guess | Result |
|---|---|
| `1234` | `4M 0F` |
| `1243` | `2M 2F` |
| `4321` | `0M 4F` |
| `1567` | `1M 0F` |
| `5678` | `0M 0F` |

### 2.4 Target Assignment (Circular Relay)
- Fixed ring: player *i* cracks the code of player *i+1*, and the last player cracks Player 1's code (P1→P2→…→PN→P1).
- In 2P, the two players crack each other's codes.
- Player 1 always takes the first turn, including on "Play Again". Players can change seats physically if they want a different order.

### 2.5 Gameplay Loop
1. **Lobby**: choose mode (**2P**, **3P**, **4P**, **Solo**), turn timer (**None**, **1m**, **3m**, **5m**), and optional player names.
2. **Private Code Setup**: each player locks in a code, then passes the device on (skipped in Solo).
3. **Turn-Based Guessing**: the active player submits one guess against their target and sees `XM YF` immediately. Between turns, a handoff screen hands the device to the next player.
4. **Solved / DNF / Skip**: a player who reaches `4M` is **Solved**; a player who gives up is **DNF**. Solved and DNF players are skipped automatically.
5. **Match End**: the match ends when **every** player is Solved or DNF. There is no round cap.
6. **Final Rankings & Reveal**: rankings, stats, and all secret codes are shown.

### 2.6 Turn Timer
- Options: None, 1m, 3m, 5m. It applies only to guessing turns, **not** to code setup.
- On expiry, the turn is **forfeited**: no guess is recorded, the attempt log shows `— timed out —`, and play passes to the next player.
- **Thinking time** (elapsed time per turn) is always tracked internally, even when the timer is None.

### 2.7 Give Up & End Match
- **Give Up**: available to the active player on their own turn, behind a confirm dialog. The player becomes **DNF** and is skipped from then on. Their target code stays hidden until the final reveal, so it can't leak to players still guessing.
- **End Match Now**: a host action in the in-game menu (behind a confirm dialog). Every player not yet Solved becomes DNF and the match goes to Final Rankings.

### 2.8 Ranking
1. **Primary**: the round in which the player solved (earlier is better).
2. **Tiebreak**: total thinking time across that player's turns (less is better).
3. Identical round and time means a shared placement.
4. **DNF** players all share last place and show their best clue reached (e.g., best `2M 1F`) for flavor.

**Stats per player**: solved round, attempts (submitted guesses only), timeouts (forfeited turns), total thinking time.

### 2.9 Solo Mode
- The app generates a random valid code; the player cracks it. There is no code-setup screen and no handoff.
- The turn timer applies if set. Give Up is available.
- End screen: attempts + total time (no podium).
- A local **personal best** (fewest attempts, then fastest time) is stored on the device.

---

## 3. User Flows & Screen Architecture

```
[1. Lobby] ──► [2. Code Setup ×N] ──► [3. Guessing ⇄ Handoff] ──► [4. Final Rankings & Reveal]
     ▲   │                                                               │
     │   └──── Solo: skips Setup ──────────────►                         │
     └─────────────── "New Game" ◄──── / "Play Again" (→ 2) ◄────────────┘
```

**Handoff screen** (shared component): full-screen "Pass to **[Name]** →" with a tap-to-continue button. It appears after each code lock, between guessing turns, and on resume. It is the only thing shown while the device changes hands.

### Screen 1: Lobby (`1A2B`)
- App title (`1A2B`) and offline mode badge.
- Rule primer: concise cards explaining `[M] Match` and `[F] Found`.
- Mode selector: segmented `2P` / `3P` / `4P` / `Solo`.
- Turn timer selector: `None` / `1m` / `3m` / `5m`.
- Optional player names (max 12 characters; default `P1`–`P4`), remembered for Play Again.
- Sound toggle (top bar), saved between sessions.
- **Resume card**: if an unfinished match exists, shows e.g. "Resume match: Round 4 · 3 players" with **Resume** / **Discard**. Resume always lands on a Handoff screen, never directly on a board or setup screen.
- Primary CTA: **"START CODE SETUP →"** (Solo: **"START →"**).
- No tab bar, no external navigation.

### Screen 2: Secret Code Setup (per player; not in Solo)
- Participant indicator (e.g., `PLAYER 1 OF 3`) and privacy note ("Turn device away from other players").
- 4 digit slots, **masked as `••••`** with press-and-hold to peek.
- Numeric keypad (`0–9`) with delete; a duplicate digit triggers a shake + warning.
- **Randomize** button fills in a valid code (peekable before locking).
- **Lock**: a single confirmation dialog ("Lock 4 8 1 9?"). No typing the code twice.
- After locking: Handoff screen to the next player (or to Player 1's first turn).

### Screen 3: Active Turn & Guessing Board
- **Header**: round indicator, active player banner with target ("P1 → cracking P2"), countdown timer (or `∞`), menu (End Match Now).
- **Guess input**: 4 active slots + numeric keypad; duplicate-digit validation.
- **Clue feedback**: the latest result shown prominently (e.g., `1M 2F`).
- **Elimination scratchpad**: digits `0–9`; tapping toggles **Neutral ↔ Eliminated**.
  - Per player; kept across that player's turns (and through resume); cleared when a new match starts, including Play Again.
  - Manual only: no automatic elimination.
  - Eliminated digits appear dimmed on the keypad but remain tappable.
- **Attempt history**: chronological list of the active player's attempts with `[M]`/`[F]` results and timeout entries, at the bottom of the screen. Boards are not secret; the Handoff screen exists only to stop someone else's tap from going in as a guess.
- **Give Up** action (confirm dialog).
- **Skip logic**: Solved/DNF players are skipped automatically.

### Screen 4: Final Rankings & Code Reveal
- Victory banner announcing the winner.
- Leaderboard (1st–4th) per §2.8: solved round, attempts, timeouts, thinking time; DNF rows show best clue.
- **Code reveal**: every player's secret code.
- Actions:
  - **"Play Again"**: same players, names, and timer; everyone sets new codes; scratchpads reset; Player 1 starts.
  - **"New Game"**: returns to the Lobby.
- Solo variant: attempts, time, personal-best comparison; "Play Again" / "New Game".

---

## 4. UI/UX Design System Specification

- **Design System Name**: Obsidian (Minimal Developer Dark)
- **Visual Direction**: High-contrast, dark terminal feel with focused purple accents.
- **Color Palette**:
  - **Surface**: `#0f131d` / `#131b2e`
  - **Surface Elevated**: `#171b26` / `#1e2433`
  - **Primary Accent**: `#a78bfa` / `#c084fc`
  - **Match `[M]`**: `#34d399`
  - **Found `[F]`**: `#fbbf24`
  - **Text High**: `#f8fafc`
  - **Text Muted**: `#94a3b8` / `#64748b`
- **Typography**: Space Grotesk / monospace styling for numbers, timers, and attempts; Manrope for body text. Fonts are **bundled with the app**, never loaded from a CDN.
- **Component Ergonomics**:
  - Thumb-friendly keypad at the bottom of the screen.
  - Flat, border-defined containers; no heavy drop shadows.
  - No bottom tab bar.
- **Feedback (MVP)**:
  - Haptics: light tap on keypad presses, stronger pulse when a result contains any `M`, success pattern on `4M`.
  - Sound: short matching cues, controlled by the Lobby sound toggle (saved between sessions).
- **Reference designs**: `designs/` (Stitch exports). Their CDN links are for preview only.

---

## 5. Technical Requirements & Non-Functional Constraints

| Dimension | Specification |
|---|---|
| **Stack** | React Native + Expo (TypeScript), NativeWind for styling, `expo-haptics` and `expo-av`/`expo-audio` for feedback. |
| **Connectivity** | 100% offline; zero network calls. No analytics or crash-reporting SDKs. |
| **Persistence** | The in-progress match is saved as a JSON snapshot (MMKV or AsyncStorage) after every state change. Also stored: player names, sound setting, Solo personal best. |
| **Performance** | Keypad and feedback respond within one frame (<16ms). |
| **Accessibility** | WCAG AA contrast; `[M]`/`[F]` use distinct letters and shapes, not color alone. |
| **Form Factor** | Phones only, portrait-locked, 360px and wider; content capped at a 480px column on larger screens. |
| **Language** | English only. |

---

## 6. Future Roadmap (Post-MVP)
- **Configurable code length**: 3-digit (blitz) or 5-digit (expert).
- **Turn replay log**: an interactive timeline of how each player narrowed down their guesses.
- **Localization**.
- **Tablet layout**.
