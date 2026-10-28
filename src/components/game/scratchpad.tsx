import { Pressable, Text, View } from 'react-native';

interface ScratchpadProps {
  eliminated: number[];
  onToggle: (digit: number) => void;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function Scratchpad({ eliminated, onToggle }: ScratchpadProps) {
  return (
    <View className="gap-2 rounded-2xl border border-line bg-raised p-3">
      <View className="flex-row items-baseline justify-between">
        <Text className="font-mono text-xs uppercase tracking-widest text-muted">Scratchpad</Text>

        <Text className="font-body text-xs text-faint">Tap digits to cross out</Text>
      </View>

      <View className="flex-row justify-between">
        {DIGITS.map((digit) => {
          const isOut = eliminated.includes(digit);

          const tone = isOut ? 'border-danger/40 bg-danger/10' : 'border-line bg-raised-high';

          const text = isOut ? 'text-danger line-through' : 'text-ink';

          return (
            <Pressable
              key={digit}
              accessibilityLabel={`${digit}, ${isOut ? 'eliminated' : 'neutral'}`}
              onPress={() => onToggle(digit)}
              className={`h-9 w-[9%] items-center justify-center rounded-md border ${tone}`}
            >
              <Text className={`font-display text-base ${text}`}>{digit}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
