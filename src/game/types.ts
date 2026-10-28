export type PlayerStatus = 'active' | 'solved' | 'dnf';

export type Attempt =
  | { kind: 'guess'; round: number; guess: string; match: number; found: number; ms: number }
  | { kind: 'timeout'; round: number; ms: number };

export interface Player {
  name: string;
  code: string | null;
  status: PlayerStatus;
  attempts: Attempt[];
  thinkingMs: number;
  solvedRound: number | null;
  eliminated: number[];
}

export type MatchMode = 'multi' | 'solo';

export type MatchPhase = 'setup' | 'playing' | 'finished';

export interface MatchConfig {
  mode: MatchMode;
  names: string[];
  timerSeconds: number;
}

export interface Match {
  config: MatchConfig;
  phase: MatchPhase;
  players: Player[];
  currentIndex: number;
  round: number;
}

export interface Clue {
  match: number;
  found: number;
}
