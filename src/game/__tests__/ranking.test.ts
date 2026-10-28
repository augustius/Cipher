import { rankPlayers } from '../ranking';
import { Attempt, Player } from '../types';

function player(overrides: Partial<Player>): Player {
  return {
    name: 'P',
    code: '1234',
    status: 'solved',
    attempts: [],
    thinkingMs: 0,
    solvedRound: 1,
    eliminated: [],
    ...overrides,
  };
}

function guess(match: number, found: number): Attempt {
  return { kind: 'guess', round: 1, guess: '0123', match, found, ms: 0 };
}

describe('rankPlayers', () => {
  it('ranks by solved round first', () => {
    const players = [
      player({ name: 'Late', solvedRound: 5, thinkingMs: 100 }),
      player({ name: 'Early', solvedRound: 3, thinkingMs: 9000 }),
    ];

    const names = rankPlayers(players).map((row) => row.player.name);

    expect(names).toEqual(['Early', 'Late']);
  });

  it('breaks same-round ties by total thinking time', () => {
    const players = [
      player({ name: 'Slow', solvedRound: 4, thinkingMs: 5000 }),
      player({ name: 'Fast', solvedRound: 4, thinkingMs: 2000 }),
    ];

    const ranked = rankPlayers(players);

    expect(ranked.map((row) => row.player.name)).toEqual(['Fast', 'Slow']);
    expect(ranked.map((row) => row.place)).toEqual([1, 2]);
  });

  it('shares a placement on identical round and time', () => {
    const players = [
      player({ name: 'A', solvedRound: 2, thinkingMs: 1000 }),
      player({ name: 'B', solvedRound: 2, thinkingMs: 1000 }),
      player({ name: 'C', solvedRound: 3, thinkingMs: 1000 }),
    ];

    const places = rankPlayers(players).map((row) => row.place);

    expect(places).toEqual([1, 1, 3]);
  });

  it('puts every DNF player in a shared last place with their best clue', () => {
    const players = [
      player({ name: 'Quit1', status: 'dnf', solvedRound: null, attempts: [guess(1, 2)] }),
      player({ name: 'Winner', solvedRound: 6 }),
      player({ name: 'Quit2', status: 'dnf', solvedRound: null, attempts: [guess(2, 1)] }),
    ];

    const ranked = rankPlayers(players);

    expect(ranked[0].player.name).toBe('Winner');
    expect(ranked.slice(1).map((row) => row.place)).toEqual([2, 2]);

    const quit2 = ranked.find((row) => row.player.name === 'Quit2');

    expect(quit2?.bestClue).toEqual({ match: 2, found: 1 });
  });

  it('counts submitted guesses and timeouts separately', () => {
    const attempts: Attempt[] = [
      guess(0, 1),
      { kind: 'timeout', round: 2, ms: 60000 },
      guess(4, 0),
    ];

    const [row] = rankPlayers([player({ attempts })]);

    expect(row.guessCount).toBe(2);
    expect(row.timeoutCount).toBe(1);
  });
});
