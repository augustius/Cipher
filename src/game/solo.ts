export interface SoloResult {
  attempts: number;
  ms: number;
}

export function nextPersonalBest(best: SoloResult | null, result: SoloResult): SoloResult {
  if (best === null) {
    return result;
  }

  const hasFewerAttempts = result.attempts < best.attempts;

  const isFasterTie = result.attempts === best.attempts && result.ms < best.ms;

  return hasFewerAttempts || isFasterTie ? result : best;
}
