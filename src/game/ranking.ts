import { Clue, Player } from './types';

export interface RankedPlayer {
  player: Player;
  seat: number;
  place: number;
  guessCount: number;
  timeoutCount: number;
  bestClue: Clue | null;
}

export function bestClue(player: Player): Clue | null {
  let best: Clue | null = null;

  for (const attempt of player.attempts) {
    if (attempt.kind !== 'guess') {
      continue;
    }

    const isBetter =
      best === null ||
      attempt.match > best.match ||
      (attempt.match === best.match && attempt.found > best.found);

    if (isBetter) {
      best = { match: attempt.match, found: attempt.found };
    }
  }

  return best;
}

function compareSolved(a: Player, b: Player): number {
  const roundDiff = (a.solvedRound ?? 0) - (b.solvedRound ?? 0);

  if (roundDiff !== 0) {
    return roundDiff;
  }

  return a.thinkingMs - b.thinkingMs;
}

function toRow(player: Player, seat: number, place: number): RankedPlayer {
  const guessCount = player.attempts.filter((attempt) => attempt.kind === 'guess').length;

  const timeoutCount = player.attempts.length - guessCount;

  return { player, seat, place, guessCount, timeoutCount, bestClue: bestClue(player) };
}

export function rankPlayers(players: Player[]): RankedPlayer[] {
  const seated = players.map((player, seat) => ({ player, seat }));

  const solved = seated
    .filter(({ player }) => player.status === 'solved')
    .sort((a, b) => compareSolved(a.player, b.player));

  const rows: RankedPlayer[] = [];

  solved.forEach(({ player, seat }, index) => {
    const previous = rows[index - 1];

    const isTied = previous !== undefined && compareSolved(previous.player, player) === 0;

    const place = isTied ? previous.place : index + 1;

    rows.push(toRow(player, seat, place));
  });

  const lastPlace = solved.length + 1;

  const unsolved = seated.filter(({ player }) => player.status !== 'solved');

  for (const { player, seat } of unsolved) {
    rows.push(toRow(player, seat, lastPlace));
  }

  return rows;
}
