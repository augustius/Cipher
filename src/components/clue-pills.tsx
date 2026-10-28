import { Text, View } from 'react-native';

import { Clue } from '@/game/types';

interface CluePillsProps {
  clue: Clue;
  size?: 'sm' | 'lg';
}

// M and F differ by letter and shape (filled vs outlined), not by color alone.
export function CluePills({ clue, size = 'sm' }: CluePillsProps) {
  const isLarge = size === 'lg';

  const padding = isLarge ? 'px-4 py-2' : 'px-2.5 py-1';

  const text = isLarge ? 'text-2xl' : 'text-sm';

  const matchTone = clue.match > 0 ? 'bg-match/20 text-match' : 'bg-raised text-faint';

  const foundTone = clue.found > 0 ? 'border-found text-found' : 'border-line text-faint';

  return (
    <View
      className="flex-row gap-2"
      accessibilityLabel={`${clue.match} match, ${clue.found} found`}
    >
      <Text className={`overflow-hidden rounded-full font-display ${padding} ${text} ${matchTone}`}>
        {clue.match}M
      </Text>

      <Text className={`rounded-full border font-display ${padding} ${text} ${foundTone}`}>
        {clue.found}F
      </Text>
    </View>
  );
}
