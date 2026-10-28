import { router } from 'expo-router';
import { Alert, Text, TextInput, View } from 'react-native';

import { Button, IconButton } from '@/components/button';
import { Screen } from '@/components/screen';
import { SegmentOption, Segmented } from '@/components/segmented';
import { Match } from '@/game/types';
import { routeFor } from '@/navigation/routes';
import { DEFAULT_NAMES, LobbyMode, useAppStore } from '@/store/app-store';
import colors from '@/theme/colors';

const MODES: SegmentOption<LobbyMode>[] = [
  { value: 2, label: '2P' },
  { value: 3, label: '3P' },
  { value: 4, label: '4P' },
  { value: 'solo', label: 'Solo' },
];

const TIMERS: SegmentOption<number>[] = [
  { value: 0, label: 'None' },
  { value: 60, label: '1m' },
  { value: 180, label: '3m' },
  { value: 300, label: '5m' },
];

const NAME_MAX_LENGTH = 12;

function RuleRow({ letter, title, body }: { letter: string; title: string; body: string }) {
  const tone = letter === 'M' ? 'bg-match/20 text-match' : 'border border-found text-found';

  return (
    <View className="flex-row items-center gap-3">
      <Text className={`h-8 w-8 rounded-md text-center font-display leading-8 ${tone}`}>
        {letter}
      </Text>

      <Text className="flex-1 font-body text-sm text-muted">
        <Text className="font-body-bold text-ink">{title}: </Text>
        {body}
      </Text>
    </View>
  );
}

function ResumeCard({ match }: { match: Match }) {
  const discardMatch = useAppStore((state) => state.discardMatch);

  const isSolo = match.config.mode === 'solo';

  const detail = isSolo ? 'Solo' : `${match.players.length} players`;

  return (
    <View className="gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
      <Text className="font-mono text-xs uppercase tracking-widest text-accent">
        Unfinished match
      </Text>

      <Text className="font-display text-lg text-ink">
        Round {match.round} · {detail}
      </Text>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button label="Discard" variant="secondary" onPress={discardMatch} />
        </View>

        <View className="flex-1">
          <Button label="Resume" onPress={() => router.replace(routeFor(match))} />
        </View>
      </View>
    </View>
  );
}

function NameFields({ count }: { count: number }) {
  const names = useAppStore((state) => state.names);

  const setName = useAppStore((state) => state.setName);

  return (
    <View className="gap-2">
      <Text className="font-mono text-xs uppercase tracking-widest text-faint">
        Names (optional)
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {Array.from({ length: count }, (_, seat) => (
          <TextInput
            key={seat}
            value={names[seat]}
            onChangeText={(text) => setName(seat, text)}
            placeholder={DEFAULT_NAMES[seat]}
            placeholderTextColor={colors.faint}
            maxLength={NAME_MAX_LENGTH}
            selectionColor={colors.accent}
            className="min-w-[45%] flex-1 rounded-xl border border-line bg-raised px-4 py-3 font-body text-ink"
          />
        ))}
      </View>
    </View>
  );
}

export default function Lobby() {
  const state = useAppStore();

  const unfinished = state.match && state.match.phase !== 'finished' ? state.match : null;

  const isSolo = state.lobbyMode === 'solo';

  const seatCount = state.lobbyMode === 'solo' ? 1 : state.lobbyMode;

  const begin = () => {
    state.startMatch();

    router.replace(isSolo ? '/game' : '/setup');
  };

  const start = () => {
    if (!unfinished) {
      begin();

      return;
    }

    Alert.alert('Start a new match?', 'The unfinished match will be discarded.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start new', style: 'destructive', onPress: begin },
    ]);
  };

  const footer = (
    <View className="gap-3">
      <Button label={isSolo ? 'START' : 'START CODE SETUP'} icon="arrow-right" onPress={start} />
    </View>
  );

  return (
    <Screen footer={footer}>
      <View className="flex-row items-center justify-between py-2">
        <View className="w-10" />

        <Text className="font-mono text-sm tracking-[4px] text-muted">CIPHER</Text>

        <IconButton
          icon={state.soundOn ? 'volume-2' : 'volume-x'}
          label={state.soundOn ? 'Mute sound' : 'Turn sound on'}
          onPress={() => state.setSoundOn(!state.soundOn)}
        />
      </View>

      <View className="items-center gap-2 py-6">
        <Text className="font-display text-4xl text-ink">Local Game</Text>

        <Text className="font-mono text-xs text-muted">
          4 digits · No repeated numbers · Offline
        </Text>
      </View>

      <View className="gap-6">
        {unfinished && <ResumeCard match={unfinished} />}

        <View className="gap-3 rounded-2xl border border-line bg-raised p-4">
          <RuleRow letter="M" title="Match" body="Correct number & position" />

          <RuleRow letter="F" title="Found" body="Correct number, wrong position" />
        </View>

        <Segmented
          label="Players"
          options={MODES}
          value={state.lobbyMode}
          onChange={state.setLobbyMode}
        />

        <Segmented
          label="Turn timer"
          options={TIMERS}
          value={state.timerSeconds}
          onChange={state.setTimerSeconds}
        />

        <NameFields count={seatCount} />
      </View>
    </Screen>
  );
}
