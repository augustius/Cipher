import { Feather } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Button } from './button';
import { Screen } from './screen';

import colors from '@/theme/colors';

interface HandoffProps {
  name: string;
  purpose: string;
  onReady: () => void;
  summary?: ReactNode;
}

// The only thing on screen while the device changes hands.
export function Handoff({ name, purpose, onReady, summary }: HandoffProps) {
  return (
    <Screen
      footer={<Button label={`I'm ${name}, continue`} icon="arrow-right" onPress={onReady} />}
    >
      <View className="min-h-[520px] items-center justify-center gap-6">
        {summary}

        <View className="h-20 w-20 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
          <Feather name="smartphone" size={32} color={colors.accent} />
        </View>

        <View className="items-center gap-2">
          <Text className="font-mono text-xs uppercase tracking-widest text-faint">
            Pass device to
          </Text>

          <Text className="font-display text-4xl text-ink">{name}</Text>

          <Text className="text-center font-body text-sm text-muted">{purpose}</Text>
        </View>
      </View>
    </Screen>
  );
}
