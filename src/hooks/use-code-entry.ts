import { useCallback, useState } from 'react';

import { CODE_LENGTH } from '@/game/code';
import { feedbackError, feedbackTap } from '@/feedback/feedback';

export function useCodeEntry() {
  const [entry, setEntry] = useState('');

  const [shakeSignal, setShakeSignal] = useState(0);

  const shake = useCallback(() => {
    feedbackError();

    setShakeSignal((signal) => signal + 1);
  }, []);

  const addDigit = useCallback(
    (digit: string) => {
      const isDuplicate = entry.includes(digit);

      const isFull = entry.length >= CODE_LENGTH;

      if (isDuplicate || isFull) {
        shake();

        return;
      }

      feedbackTap();

      setEntry(entry + digit);
    },
    [entry, shake],
  );

  const deleteDigit = useCallback(() => setEntry((value) => value.slice(0, -1)), []);

  const clear = useCallback(() => setEntry(''), []);

  const isComplete = entry.length === CODE_LENGTH;

  return { entry, setEntry, addDigit, deleteDigit, clear, isComplete, shakeSignal, shake };
}
