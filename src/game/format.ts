export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function ordinal(place: number): string {
  const suffixes: Record<number, string> = { 1: 'ST', 2: 'ND', 3: 'RD' };

  return `${place}${suffixes[place] ?? 'TH'}`;
}

export function plural(count: number, word: string): string {
  const suffix = word.endsWith('s') ? 'es' : 's';

  return `${count} ${word}${count === 1 ? '' : suffix}`;
}
