import {
  createMatch,
  endMatch,
  giveUp,
  lockCode,
  submitGuess,
  targetIndex,
  timeOut,
  toggleEliminated,
} from '../match';
import { Match } from '../types';

function startedMatch(codes: string[]): Match {
  const names = codes.map((_, i) => `P${i + 1}`);

  let match = createMatch({ mode: 'multi', names, timerSeconds: 0 });

  for (const code of codes) {
    match = lockCode(match, code);
  }

  return match;
}

describe('targetIndex', () => {
  it('points each player at the next seat, wrapping around', () => {
    expect(targetIndex(0, 3)).toBe(1);
    expect(targetIndex(2, 3)).toBe(0);
  });

  it('makes the two players of a 2P match crack each other', () => {
    expect(targetIndex(0, 2)).toBe(1);
    expect(targetIndex(1, 2)).toBe(0);
  });
});

describe('setup', () => {
  it('moves through each seat, then starts round 1 with Player 1', () => {
    const match = createMatch({ mode: 'multi', names: ['A', 'B'], timerSeconds: 60 });

    expect(match.phase).toBe('setup');

    const afterFirst = lockCode(match, '1234');

    expect(afterFirst.phase).toBe('setup');
    expect(afterFirst.currentIndex).toBe(1);

    const started = lockCode(afterFirst, '5678');

    expect(started.phase).toBe('playing');
    expect(started.currentIndex).toBe(0);
    expect(started.round).toBe(1);
  });

  it('rejects an invalid code', () => {
    const match = createMatch({ mode: 'multi', names: ['A', 'B'], timerSeconds: 0 });

    expect(() => lockCode(match, '1123')).toThrow();
  });

  it('starts Solo immediately with a generated code', () => {
    const match = createMatch({ mode: 'solo', names: ['Me'], timerSeconds: 0 }, () => 0);

    expect(match.phase).toBe('playing');
    expect(match.players[0].code).toBe('0123');
    expect(targetIndex(0, 1)).toBe(0);
  });
});

describe('guessing', () => {
  it('scores against the target code and records the attempt', () => {
    const match = startedMatch(['1234', '5678']);

    const next = submitGuess(match, '5687', 1500);

    const attempt = next.players[0].attempts[0];

    expect(attempt).toEqual({
      kind: 'guess',
      round: 1,
      guess: '5687',
      match: 2,
      found: 2,
      ms: 1500,
    });
    expect(next.players[0].thinkingMs).toBe(1500);
    expect(next.currentIndex).toBe(1);
    expect(next.round).toBe(1);
  });

  it('starts a new round when play wraps back to the first seat', () => {
    let match = startedMatch(['1234', '5678']);

    match = submitGuess(match, '0123', 10);
    match = submitGuess(match, '0123', 10);

    expect(match.currentIndex).toBe(0);
    expect(match.round).toBe(2);
  });

  it('rejects a guess with repeated digits but allows repeating a past guess', () => {
    let match = startedMatch(['1234', '5678']);

    expect(() => submitGuess(match, '5568', 10)).toThrow();

    match = submitGuess(match, '0123', 10);
    match = submitGuess(match, '0123', 10);
    match = submitGuess(match, '0123', 10);

    expect(match.players[0].attempts).toHaveLength(2);
  });

  it('marks a 4M guess as solved and skips that player afterwards', () => {
    let match = startedMatch(['1234', '5678', '9012']);

    match = submitGuess(match, '5678', 10);

    expect(match.players[0].status).toBe('solved');
    expect(match.players[0].solvedRound).toBe(1);

    match = submitGuess(match, '3456', 10);
    match = submitGuess(match, '3456', 10);

    expect(match.currentIndex).toBe(1);
    expect(match.round).toBe(2);
  });

  it('finishes when every player is solved', () => {
    let match = startedMatch(['1234', '5678']);

    match = submitGuess(match, '5678', 10);
    match = submitGuess(match, '1234', 10);

    expect(match.phase).toBe('finished');
  });
});

describe('timer expiry', () => {
  it('forfeits the turn and logs a timeout', () => {
    const match = startedMatch(['1234', '5678']);

    const next = timeOut(match, 60000);

    expect(next.players[0].attempts[0]).toEqual({ kind: 'timeout', round: 1, ms: 60000 });
    expect(next.players[0].thinkingMs).toBe(60000);
    expect(next.currentIndex).toBe(1);
  });
});

describe('give up and end match', () => {
  it('marks the active player DNF and passes the turn', () => {
    const match = startedMatch(['1234', '5678', '9012']);

    const next = giveUp(match);

    expect(next.players[0].status).toBe('dnf');
    expect(next.currentIndex).toBe(1);
    expect(next.phase).toBe('playing');
  });

  it('finishes once everyone is solved or DNF', () => {
    let match = startedMatch(['1234', '5678']);

    match = submitGuess(match, '5678', 10);
    match = giveUp(match);

    expect(match.phase).toBe('finished');
  });

  it('end match marks every unsolved player DNF', () => {
    let match = startedMatch(['1234', '5678', '9012']);

    match = submitGuess(match, '5678', 10);
    match = endMatch(match);

    const statuses = match.players.map((player) => player.status);

    expect(statuses).toEqual(['solved', 'dnf', 'dnf']);
    expect(match.phase).toBe('finished');
  });
});

describe('scratchpad', () => {
  it('toggles a digit between neutral and eliminated for one player only', () => {
    let match = startedMatch(['1234', '5678']);

    match = toggleEliminated(match, 0, 7);

    expect(match.players[0].eliminated).toEqual([7]);
    expect(match.players[1].eliminated).toEqual([]);

    match = toggleEliminated(match, 0, 7);

    expect(match.players[0].eliminated).toEqual([]);
  });

  it('keeps eliminations across turns', () => {
    let match = startedMatch(['1234', '5678']);

    match = toggleEliminated(match, 0, 9);
    match = submitGuess(match, '0123', 10);
    match = submitGuess(match, '0123', 10);

    expect(match.players[0].eliminated).toEqual([9]);
  });
});
