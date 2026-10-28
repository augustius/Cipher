import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import * as rules from '@/game/match';
import { nextPersonalBest, SoloResult } from '@/game/solo';
import { Match, MatchConfig } from '@/game/types';

export type LobbyMode = 2 | 3 | 4 | 'solo';

export const DEFAULT_NAMES = ['P1', 'P2', 'P3', 'P4'];

interface AppState {
  match: Match | null;
  lobbyMode: LobbyMode;
  timerSeconds: number;
  names: string[];
  soundOn: boolean;
  soloBest: SoloResult | null;
  hasHydrated: boolean;

  setLobbyMode: (mode: LobbyMode) => void;
  setTimerSeconds: (seconds: number) => void;
  setName: (seat: number, name: string) => void;
  setSoundOn: (on: boolean) => void;

  startMatch: () => void;
  playAgain: () => void;
  discardMatch: () => void;

  lockCode: (code: string) => void;
  submitGuess: (guess: string, ms: number) => void;
  timeOut: (ms: number) => void;
  giveUp: () => void;
  endMatch: () => void;
  toggleEliminated: (digit: number) => void;
}

function displayName(names: string[], seat: number): string {
  const typed = names[seat]?.trim();

  return typed ? typed : DEFAULT_NAMES[seat];
}

function buildConfig(mode: LobbyMode, timerSeconds: number, names: string[]): MatchConfig {
  if (mode === 'solo') {
    return { mode: 'solo', names: [displayName(names, 0)], timerSeconds };
  }

  const seats = Array.from({ length: mode }, (_, seat) => displayName(names, seat));

  return { mode: 'multi', names: seats, timerSeconds };
}

function soloResult(match: Match): SoloResult | null {
  const [player] = match.players;

  const isSolvedSolo = match.config.mode === 'solo' && player.status === 'solved';

  if (!isSolvedSolo) {
    return null;
  }

  const attempts = player.attempts.filter((attempt) => attempt.kind === 'guess').length;

  return { attempts, ms: player.thinkingMs };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const updateMatch = (change: (match: Match) => Match) => {
        const { match, soloBest } = get();

        if (!match) {
          return;
        }

        const next = change(match);

        const result = next.phase === 'finished' ? soloResult(next) : null;

        const best = result ? nextPersonalBest(soloBest, result) : soloBest;

        set({ match: next, soloBest: best });
      };

      return {
        match: null,
        lobbyMode: 2,
        timerSeconds: 0,
        names: ['', '', '', ''],
        soundOn: true,
        soloBest: null,
        hasHydrated: false,

        setLobbyMode: (lobbyMode) => set({ lobbyMode }),
        setTimerSeconds: (timerSeconds) => set({ timerSeconds }),
        setSoundOn: (soundOn) => set({ soundOn }),

        setName: (seat, name) => {
          const names = [...get().names];

          names[seat] = name;

          set({ names });
        },

        startMatch: () => {
          const { lobbyMode, timerSeconds, names } = get();

          const config = buildConfig(lobbyMode, timerSeconds, names);

          set({ match: rules.createMatch(config) });
        },

        playAgain: () => {
          const { match } = get();

          if (match) {
            set({ match: rules.createMatch(match.config) });
          }
        },

        discardMatch: () => set({ match: null }),

        lockCode: (code) => updateMatch((match) => rules.lockCode(match, code)),
        submitGuess: (guess, ms) => updateMatch((match) => rules.submitGuess(match, guess, ms)),
        timeOut: (ms) => updateMatch((match) => rules.timeOut(match, ms)),
        giveUp: () => updateMatch(rules.giveUp),
        endMatch: () => updateMatch(rules.endMatch),

        toggleEliminated: (digit) =>
          updateMatch((match) => rules.toggleEliminated(match, match.currentIndex, digit)),
      };
    },
    {
      name: 'cipher-state',
      storage: createJSONStorage(() => Storage),
      partialize: ({ hasHydrated, ...saved }) => saved,
      onRehydrateStorage: () => () => useAppStore.setState({ hasHydrated: true }),
    },
  ),
);
