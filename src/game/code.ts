import { Clue } from './types';

export const CODE_LENGTH = 4;

const DIGITS = '0123456789';

export function hasDuplicateDigits(entry: string): boolean {
  return new Set(entry).size !== entry.length;
}

export function isValidCode(code: string): boolean {
  const isRightLength = code.length === CODE_LENGTH;

  const isAllDigits = /^\d+$/.test(code);

  return isRightLength && isAllDigits && !hasDuplicateDigits(code);
}

export function randomCode(random: () => number = Math.random): string {
  const pool = DIGITS.split('');

  let code = '';

  while (code.length < CODE_LENGTH) {
    const index = Math.floor(random() * pool.length);

    code += pool.splice(index, 1)[0];
  }

  return code;
}

export function scoreGuess(code: string, guess: string): Clue {
  let match = 0;
  let found = 0;

  for (let i = 0; i < guess.length; i++) {
    const digit = guess[i];

    if (code[i] === digit) {
      match++;
    } else if (code.includes(digit)) {
      found++;
    }
  }

  return { match, found };
}
