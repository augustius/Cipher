import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { IconButton } from '@/components/button';
import { formatDuration } from '@/game/format';
import colors from '@/theme/colors';

interface TurnHeaderProps {
  round: number;
  playerName: string;
  targetName: string | null;
  remainingMs: number | null;
  onMenu: () => void;
}

const LOW_TIME_MS = 10000;

export function TurnHeader(props: TurnHeaderProps) {
  const { round, playerName, targetName, remainingMs, onMenu } = props;

  const isLow = remainingMs !== null && remainingMs <= LOW_TIME_MS;

  const timerTone = isLow ? 'border-found text-found' : 'border-match/40 text-match';

  const timerText = remainingMs === null ? '∞' : formatDuration(remainingMs);

  return (
    <View className="gap-3 py-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Feather name="lock" size={18} color={colors.accent} />

          <Text className="font-display text-xl text-accent">Cipher</Text>
        </View>

        <IconButton icon="more-horizontal" label="Match menu" onPress={onMenu} />
      </View>

      <View className="flex-row items-center justify-between rounded-2xl border border-line bg-raised p-4">
        <View className="flex-1 gap-1">
          <Text className="font-mono text-xs uppercase tracking-widest text-faint">
            Round {round}
          </Text>

          <Text className="font-display text-lg text-ink" numberOfLines={1}>
            {playerName}
            {targetName && <Text className="text-muted"> → cracking {targetName}</Text>}
          </Text>
        </View>

        <Text className={`rounded-lg border px-3 py-1.5 font-mono text-sm ${timerTone}`}>
          {timerText}
        </Text>
      </View>
    </View>
  );
}
