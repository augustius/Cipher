import { CODE_LENGTH, isValidCode, randomCode, scoreGuess } from './code';
import { Attempt, Match, MatchConfig, Player } from './types';

export function targetIndex(seat: number, playerCount: number): number {
  return (seat + 1) % playerCount;
}

function newPlayer(name: string, code: string | null): Player {
  return {
    name,
    code,
    status: 'active',
    attempts: [],
    thinkingMs: 0,
    solvedRound: null,
    eliminated: [],
  };
}

export function createMatch(config: MatchConfig, random?: () => number): Match {
  if (config.mode === 'solo') {
    const solo = newPlayer(config.names[0], randomCode(random));

    return { config, phase: 'playing', players: [solo], currentIndex: 0, round: 1 };
  }

  const players = config.names.map((name) => newPlayer(name, null));

  return { config, phase: 'setup', players, currentIndex: 0, round: 1 };
}

export function lockCode(match: Match, code: string): Match {
  if (match.phase !== 'setup') {
    throw new Error('Codes can only be locked during setup');
  }

  if (!isValidCode(code)) {
    throw new Error(`A code needs ${CODE_LENGTH} unique digits`);
  }

  const players = replacePlayer(match.players, match.currentIndex, { code });

  const nextSeat = match.currentIndex + 1;

  const isSetupDone = nextSeat === players.length;

  if (isSetupDone) {
    return { ...match, players, phase: 'playing', currentIndex: 0, round: 1 };
  }

  return { ...match, players, currentIndex: nextSeat };
}

export function currentTargetCode(match: Match): string {
  const target = targetIndex(match.currentIndex, match.players.length);

  return match.players[target].code ?? '';
}

export function submitGuess(match: Match, guess: string, ms: number): Match {
  assertPlaying(match);

  if (!isValidCode(guess)) {
    throw new Error(`A guess needs ${CODE_LENGTH} unique digits`);
  }

  const clue = scoreGuess(currentTargetCode(match), guess);

  const attempt: Attempt = { kind: 'guess', round: match.round, guess, ...clue, ms };

  const player = match.players[match.currentIndex];

  const isSolved = clue.match === CODE_LENGTH;

  const update: Partial<Player> = {
    attempts: [...player.attempts, attempt],
    thinkingMs: player.thinkingMs + ms,
    ...(isSolved ? { status: 'solved' as const, solvedRound: match.round } : {}),
  };

  const players = replacePlayer(match.players, match.currentIndex, update);

  return advanceTurn({ ...match, players });
}

export function timeOut(match: Match, ms: number): Match {
  assertPlaying(match);

  const player = match.players[match.currentIndex];

  const attempt: Attempt = { kind: 'timeout', round: match.round, ms };

  const players = replacePlayer(match.players, match.currentIndex, {
    attempts: [...player.attempts, attempt],
    thinkingMs: player.thinkingMs + ms,
  });

  return advanceTurn({ ...match, players });
}

export function giveUp(match: Match): Match {
  assertPlaying(match);

  const players = replacePlayer(match.players, match.currentIndex, { status: 'dnf' });

  return advanceTurn({ ...match, players });
}

export function endMatch(match: Match): Match {
  const players = match.players.map((player) => {
    const isUnsolved = player.status !== 'solved';

    return isUnsolved ? { ...player, status: 'dnf' as const } : player;
  });

  return { ...match, players, phase: 'finished' };
}

export function toggleEliminated(match: Match, seat: number, digit: number): Match {
  const { eliminated } = match.players[seat];

  const isEliminated = eliminated.includes(digit);

  const nextEliminated = isEliminated
    ? eliminated.filter((value) => value !== digit)
    : [...eliminated, digit].sort((a, b) => a - b);

  const players = replacePlayer(match.players, seat, { eliminated: nextEliminated });

  return { ...match, players };
}

function advanceTurn(match: Match): Match {
  const count = match.players.length;

  for (let step = 1; step <= count; step++) {
    const seat = (match.currentIndex + step) % count;

    if (match.players[seat].status !== 'active') {
      continue;
    }

    const wrapped = seat <= match.currentIndex;

    const round = wrapped ? match.round + 1 : match.round;

    return { ...match, currentIndex: seat, round };
  }

  return { ...match, phase: 'finished' };
}

function assertPlaying(match: Match): void {
  if (match.phase !== 'playing') {
    throw new Error('The match is not in progress');
  }
}

function replacePlayer(players: Player[], seat: number, update: Partial<Player>): Player[] {
  return players.map((player, index) => (index === seat ? { ...player, ...update } : player));
}
