import { Text, View } from 'react-native';

import { CluePills } from '@/components/clue-pills';
import { DigitRow } from '@/components/digit-box';
import { plural } from '@/game/format';
import { Attempt } from '@/game/types';

interface AttemptHistoryProps {
  attempts: Attempt[];
  targetLabel: string;
}

function AttemptRow({ attempt, number }: { attempt: Attempt; number: number }) {
  const label = `#${String(number).padStart(2, '0')}`;

  return (
    <View className="flex-row items-center justify-between rounded-xl border border-line bg-raised-high/40 px-3 py-2">
      <View className="flex-row items-center gap-3">
        <Text className="font-mono text-sm text-accent/70">{label}</Text>

        {attempt.kind === 'guess' ? (
          <DigitRow digits={attempt.guess} />
        ) : (
          <Text className="font-mono text-sm text-faint">— timed out —</Text>
        )}
      </View>

      {attempt.kind === 'guess' && <CluePills clue={attempt} />}
    </View>
  );
}

export function AttemptHistory({ attempts, targetLabel }: AttemptHistoryProps) {
  return (
    <View className="gap-3 rounded-2xl border border-line bg-raised p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-display text-lg text-ink">Attempt History</Text>

          <Text className="font-body text-xs text-faint">{targetLabel}</Text>
        </View>

        <Text className="font-mono text-xs text-muted">{plural(attempts.length, 'turn')}</Text>
      </View>

      {attempts.length === 0 && (
        <Text className="py-3 text-center font-body text-sm text-faint">No attempts yet</Text>
      )}

      {attempts.map((attempt, index) => (
        <AttemptRow key={index} attempt={attempt} number={index + 1} />
      ))}
    </View>
  );
}
