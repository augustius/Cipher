import { Text, View } from 'react-native';

interface DigitBoxProps {
  digit: string;
  size?: 'sm' | 'lg';
}

// The text is centered by its container, so tall glyphs never clip against a fixed line height.
export function DigitBox({ digit, size = 'sm' }: DigitBoxProps) {
  const isLarge = size === 'lg';

  const box = isLarge ? 'h-12 w-10 rounded-lg border border-line' : 'h-8 w-7 rounded-md';

  const text = isLarge ? 'text-2xl text-accent' : 'text-lg text-ink';

  return (
    <View className={`items-center justify-center bg-raised-high ${box}`}>
      <Text className={`font-display ${text}`}>{digit}</Text>
    </View>
  );
}

export function DigitRow({ digits, size }: { digits: string; size?: 'sm' | 'lg' }) {
  const gap = size === 'lg' ? 'gap-2' : 'gap-1.5';

  return (
    <View className={`flex-row ${gap}`}>
      {digits.split('').map((digit, index) => (
        <DigitBox key={index} digit={digit} size={size} />
      ))}
    </View>
  );
}
