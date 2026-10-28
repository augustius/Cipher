import { Feather } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { CodeSlots } from '@/components/code-slots';
import { Handoff } from '@/components/handoff';
import { Keypad } from '@/components/keypad';
import { Screen } from '@/components/screen';
import { randomCode } from '@/game/code';
import { targetIndex } from '@/game/match';
import { useCodeEntry } from '@/hooks/use-code-entry';
import { routeFor } from '@/navigation/routes';
import { useAppStore } from '@/store/app-store';
import colors from '@/theme/colors';

export default function Setup() {
  const match = useAppStore((state) => state.match);

  const lockCode = useAppStore((state) => state.lockCode);

  const code = useCodeEntry();

  const [readySeat, setReadySeat] = useState<number | null>(null);

  const [isPeeking, setIsPeeking] = useState(false);

  if (!match || match.phase !== 'setup') {
    return <Redirect href={routeFor(match)} />;
  }

  const seat = match.currentIndex;

  const count = match.players.length;

  const player = match.players[seat];

  const guesser = match.players[(seat - 1 + count) % count];

  const nextName = match.players[targetIndex(seat, count)].name;

  if (readySeat !== seat) {
    return (
      <Handoff
        name={player.name}
        purpose="Set your secret code. Keep the screen hidden from everyone else."
        onReady={() => {
          code.clear();

          setReadySeat(seat);
        }}
      />
    );
  }

  const lock = () => {
    const spaced = code.entry.split('').join(' ');

    Alert.alert(`Lock ${spaced}?`, 'You cannot change it after locking.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Lock',
        onPress: () => {
          lockCode(code.entry);

          const isLastSeat = seat === count - 1;

          if (isLastSeat) {
            router.replace('/game');
          }
        },
      },
    ]);
  };

  const footer = (
    <Button
      label={seat === count - 1 ? 'Lock code & start' : `Lock code & pass to ${nextName}`}
      icon="lock"
      disabled={!code.isComplete}
      onPress={lock}
    />
  );

  return (
    <Screen footer={footer}>
      <View className="items-center gap-3 py-6">
        <Text className="rounded-full border border-line px-3 py-1 font-mono text-xs tracking-widest text-muted">
          PASS & PLAY · {seat + 1} OF {count}
        </Text>

        <Text className="font-display text-2xl text-ink">{player.name}: Enter Secret Code</Text>

        <Text className="text-center font-body text-sm text-muted">
          Keep screen hidden. {guesser.name} will try to crack this code.
        </Text>
      </View>

      <View className="gap-5">
        <View className="flex-row items-center gap-2 rounded-xl border border-line bg-raised p-3">
          <Feather name="info" size={16} color={colors.accent} />

          <Text className="font-body text-sm text-muted">
            4 unique digits (0-9). No duplicates allowed.
          </Text>
        </View>

        <CodeSlots entry={code.entry} masked={!isPeeking} shakeSignal={code.shakeSignal} />

        <View className="flex-row justify-center gap-6">
          <Pressable
            onPressIn={() => setIsPeeking(true)}
            onPressOut={() => setIsPeeking(false)}
            className="flex-row items-center gap-2 py-2"
          >
            <Feather name="eye" size={16} color={colors.muted} />

            <Text className="font-body text-sm text-muted">Hold to peek</Text>
          </Pressable>

          <Pressable
            onPress={() => code.setEntry(randomCode())}
            className="flex-row items-center gap-2 py-2"
          >
            <Feather name="shuffle" size={16} color={colors.accent} />

            <Text className="font-body text-sm text-accent">Randomize</Text>
          </Pressable>
        </View>

        <Keypad
          entry={code.entry}
          onDigit={code.addDigit}
          onDelete={code.deleteDigit}
          onClear={code.clear}
        />
      </View>
    </Screen>
  );
}
