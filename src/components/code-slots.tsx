import { useEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import { CODE_LENGTH } from '@/game/code';

interface CodeSlotsProps {
  entry: string;
  masked?: boolean;
  shakeSignal?: number;
}

function useShake(signal: number | undefined) {
  const [offset] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!signal) {
      return;
    }

    const step = (toValue: number) =>
      Animated.timing(offset, { toValue, duration: 45, useNativeDriver: true });

    Animated.sequence([step(10), step(-10), step(8), step(-8), step(0)]).start();
  }, [signal, offset]);

  return offset;
}

export function CodeSlots({ entry, masked = false, shakeSignal }: CodeSlotsProps) {
  const offset = useShake(shakeSignal);

  const slots = Array.from({ length: CODE_LENGTH }, (_, index) => entry[index] ?? null);

  return (
    <Animated.View
      className="flex-row justify-center gap-3"
      style={{ transform: [{ translateX: offset }] }}
    >
      {slots.map((digit, index) => {
        const isNext = index === entry.length;

        const border = isNext ? 'border-accent' : 'border-line';

        const shown = digit === null ? '' : masked ? '•' : digit;

        return (
          <View
            key={index}
            className={`h-[72px] w-16 items-center justify-center rounded-xl border bg-raised ${border}`}
          >
            <Text className="font-display text-4xl text-ink">{shown}</Text>

            <Text className="absolute bottom-1 font-mono text-[10px] text-faint">#{index + 1}</Text>
          </View>
        );
      })}
    </Animated.View>
  );
}
