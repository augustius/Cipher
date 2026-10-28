import { hasDuplicateDigits, isValidCode, randomCode, scoreGuess } from '../code';

describe('isValidCode', () => {
  it('accepts 4 unique digits, including a leading zero', () => {
    expect(isValidCode('4819')).toBe(true);
    expect(isValidCode('0123')).toBe(true);
  });

  it('rejects repeated digits', () => {
    expect(isValidCode('4419')).toBe(false);
  });

  it('rejects wrong length or non-digits', () => {
    expect(isValidCode('123')).toBe(false);
    expect(isValidCode('12345')).toBe(false);
    expect(isValidCode('12a4')).toBe(false);
  });
});

describe('hasDuplicateDigits', () => {
  it('detects a repeat in a partial entry', () => {
    expect(hasDuplicateDigits('44')).toBe(true);
    expect(hasDuplicateDigits('402')).toBe(false);
  });
});

describe('randomCode', () => {
  it('always produces a valid code', () => {
    for (let i = 0; i < 200; i++) {
      expect(isValidCode(randomCode())).toBe(true);
    }
  });

  it('uses the injected random source', () => {
    const alwaysZero = () => 0;

    expect(randomCode(alwaysZero)).toBe('0123');
  });
});

describe('scoreGuess (PRD §2.3 acceptance table, code 1234)', () => {
  const cases: [string, number, number][] = [
    ['1234', 4, 0],
    ['1243', 2, 2],
    ['4321', 0, 4],
    ['1567', 1, 0],
    ['5678', 0, 0],
  ];

  it.each(cases)('guess %s scores %iM %iF', (guess, match, found) => {
    expect(scoreGuess('1234', guess)).toEqual({ match, found });
  });
});
