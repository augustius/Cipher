import { useCallback, useEffect, useRef, useState } from 'react';

interface TurnClock {
  elapsedMs: () => number;
  remainingMs: number | null;
}

interface Tick {
  turnKey: string;
  startedAt: number;
  now: number;
}

const TICK_MS = 250;

// Tracks thinking time for a turn and fires onExpire once when a limit is set and reached.
export function useTurnClock(
  turnKey: string,
  running: boolean,
  limitSeconds: number,
  onExpire: (elapsedMs: number) => void,
): TurnClock {
  const startedAt = useRef(0);

  const expireRef = useRef(onExpire);

  const [tick, setTick] = useState<Tick | null>(null);

  useEffect(() => {
    expireRef.current = onExpire;
  });

  useEffect(() => {
    if (!running) {
      return;
    }

    const start = Date.now();

    const limitMs = limitSeconds * 1000;

    let expired = false;

    startedAt.current = start;

    const timer = setInterval(() => {
      const now = Date.now();

      setTick({ turnKey, startedAt: start, now });

      const hasExpired = limitMs > 0 && now - start >= limitMs;

      if (hasExpired && !expired) {
        expired = true;

        expireRef.current(limitMs);
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [turnKey, running, limitSeconds]);

  const elapsedMs = useCallback(() => Date.now() - startedAt.current, []);

  const isCurrentTick = running && tick?.turnKey === turnKey;

  const elapsed = isCurrentTick ? tick.now - tick.startedAt : 0;

  const remainingMs = limitSeconds > 0 ? Math.max(0, limitSeconds * 1000 - elapsed) : null;

  return { elapsedMs, remainingMs };
}
