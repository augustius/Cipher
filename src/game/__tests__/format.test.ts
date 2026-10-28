import { formatDuration, ordinal, plural } from '../format';

describe('formatDuration', () => {
  it('formats milliseconds as mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(252000)).toBe('04:12');
  });
});

describe('ordinal', () => {
  it('labels podium places', () => {
    expect([1, 2, 3, 4].map(ordinal)).toEqual(['1ST', '2ND', '3RD', '4TH']);
  });
});

describe('plural', () => {
  it('adds an s for anything but one', () => {
    expect(plural(1, 'guess')).toBe('1 guess');
    expect(plural(0, 'turn')).toBe('0 turns');
    expect(plural(3, 'timeout')).toBe('3 timeouts');
    expect(plural(2, 'guess')).toBe('2 guesses');
  });
});
