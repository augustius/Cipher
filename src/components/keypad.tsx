import { Feather } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import colors from '@/theme/colors';

interface KeypadProps {
  entry: string;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

interface KeyProps {
  onPress: () => void;
  label: string;
  disabled?: boolean;
  children: ReactNode;
}

function Key({ onPress, label, disabled, children }: KeyProps) {
  const tone = disabled ? 'opacity-35' : '';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="keyboardkey"
      disabled={disabled}
      onPress={onPress}
      className={`h-14 flex-1 items-center justify-center rounded-2xl border border-line bg-raised-high active:scale-95 active:bg-accent/20 ${tone}`}
    >
      {children}
    </Pressable>
  );
}

function DigitKey({ digit, entry, onDigit }: KeypadProps & { digit: string }) {
  // Digits already in the entry are disabled because codes and guesses never repeat a digit.
  const isUsed = entry.includes(digit);

  return (
    <Key label={digit} disabled={isUsed} onPress={() => onDigit(digit)}>
      <Text className="font-display text-2xl text-ink">{digit}</Text>

      {isUsed && <Text className="font-mono text-[9px] uppercase text-faint">used</Text>}
    </Key>
  );
}

export function Keypad(props: KeypadProps) {
  const { onDelete, onClear } = props;

  return (
    <View className="gap-3">
      {ROWS.map((row) => (
        <View key={row[0]} className="flex-row gap-3">
          {row.map((digit) => (
            <DigitKey key={digit} {...props} digit={digit} />
          ))}
        </View>
      ))}

      <View className="flex-row gap-3">
        <Key label="Clear" onPress={onClear}>
          <Text className="font-mono text-xs uppercase tracking-widest text-muted">Clear</Text>
        </Key>

        <DigitKey {...props} digit="0" />

        <Key label="Delete" onPress={onDelete}>
          <Feather name="delete" size={22} color={colors.muted} />
        </Key>
      </View>
    </View>
  );
}
