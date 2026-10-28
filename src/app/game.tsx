import { Redirect, router } from 'expo-router';
import { ReactNode, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { CluePills } from '@/components/clue-pills';
import { CodeSlots } from '@/components/code-slots';
import { AttemptHistory } from '@/components/game/attempt-history';
import { MatchMenu } from '@/components/game/match-menu';
import { RelayStatus } from '@/components/game/relay-status';
import { Scratchpad } from '@/components/game/scratchpad';
import { TurnHeader } from '@/components/game/turn-header';
import { Handoff } from '@/components/handoff';
import { Keypad } from '@/components/keypad';
import { Screen } from '@/components/screen';
import { feedbackClue, feedbackError, feedbackSolved } from '@/feedback/feedback';
import { CODE_LENGTH } from '@/game/code';
import { targetIndex } from '@/game/match';
import { Clue, Match } from '@/game/types';
import { useCodeEntry } from '@/hooks/use-code-entry';
import { useTurnClock } from '@/hooks/use-turn-clock';
import { routeFor } from '@/navigation/routes';
import { useAppStore } from '@/store/app-store';

interface TurnEvent {
  name: string;
  message: string;
  clue?: Clue;
}

function latestClue(match: Match): Clue | null {
  const { attempts } = match.players[match.currentIndex];

  for (let i = attempts.length - 1; i >= 0; i--) {
    const attempt = attempts[i];

    if (attempt.kind === 'guess') {
      return attempt;
    }
  }

  return null;
}

function EventSummary({ event }: { event: TurnEvent }) {
  return (
    <View className="w-full items-center gap-3 rounded-2xl border border-line bg-raised p-5">
      <Text className="font-mono text-xs uppercase tracking-widest text-faint">{event.name}</Text>

      {event.clue && <CluePills clue={event.clue} size="lg" />}

      <Text className="text-center font-body text-sm text-muted">{event.message}</Text>
    </View>
  );
}

export default function Game() {
  const store = useAppStore();

  const { match } = store;

  const code = useCodeEntry();

  const [readyKey, setReadyKey] = useState<string | null>(null);

  const [lastEvent, setLastEvent] = useState<TurnEvent | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const isPlaying = match?.phase === 'playing';

  const isSolo = match?.config.mode === 'solo';

  const turnKey = match ? `${match.round}-${match.currentIndex}` : '';

  const isHandedOff = isSolo || readyKey === turnKey;

  const limitSeconds = match?.config.timerSeconds ?? 0;

  const clock = useTurnClock(turnKey, isPlaying && isHandedOff, limitSeconds, onExpire);

  function afterTurn(event: TurnEvent): void {
    code.clear();

    setLastEvent(event);

    const next = useAppStore.getState().match;

    if (next?.phase === 'finished') {
      router.replace('/results');
    }
  }

  function onExpire(limitMs: number): void {
    const name = match?.players[match.currentIndex].name ?? '';

    feedbackError();

    store.timeOut(limitMs);

    afterTurn({ name, message: "Time's up. Turn forfeited." });
  }

  if (!match || !isPlaying) {
    return <Redirect href={routeFor(match)} />;
  }

  const count = match.players.length;

  const player = match.players[match.currentIndex];

  const targetName = isSolo ? null : match.players[targetIndex(match.currentIndex, count)].name;

  if (!isHandedOff) {
    const summary: ReactNode = lastEvent ? <EventSummary event={lastEvent} /> : null;

    return (
      <Handoff
        name={player.name}
        purpose={`Round ${match.round}. Your turn to crack ${targetName}'s code.`}
        summary={summary}
        onReady={() => setReadyKey(turnKey)}
      />
    );
  }

  const submit = () => {
    const seat = match.currentIndex;

    store.submitGuess(code.entry, clock.elapsedMs());

    const updated = useAppStore.getState().match;

    const attempt = updated?.players[seat].attempts.at(-1);

    if (attempt?.kind !== 'guess') {
      return;
    }

    const isSolved = attempt.match === CODE_LENGTH;

    if (isSolved) {
      feedbackSolved();
    } else {
      feedbackClue(attempt.match);
    }

    const message = isSolved
      ? 'Code cracked! Turns from now on are skipped.'
      : `Guess ${attempt.guess}`;

    afterTurn({ name: player.name, message, clue: attempt });
  };

  const confirm = (title: string, body: string, action: () => void) => {
    setMenuOpen(false);

    Alert.alert(title, body, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: action },
    ]);
  };

  const giveUp = () =>
    confirm('Give up?', 'You will be marked DNF and skipped for the rest of the match.', () => {
      store.giveUp();

      afterTurn({ name: player.name, message: 'Gave up. Marked DNF.' });
    });

  const endMatch = () =>
    confirm('End match now?', 'Everyone still guessing will be marked DNF.', () => {
      store.endMatch();

      router.replace('/results');
    });

  const clue = latestClue(match);

  const footer = (
    <Button label="Submit Guess" icon="send" disabled={!code.isComplete} onPress={submit} />
  );

  return (
    <Screen footer={footer}>
      <TurnHeader
        round={match.round}
        playerName={player.name}
        targetName={targetName}
        remainingMs={clock.remainingMs}
        onMenu={() => setMenuOpen(true)}
      />

      <View className="gap-4">
        <Scratchpad eliminated={player.eliminated} onToggle={store.toggleEliminated} />

        <View className="gap-4 rounded-2xl border border-line bg-raised p-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-mono text-xs uppercase tracking-widest text-muted">
              Guess #{String(player.attempts.length + 1).padStart(2, '0')}
            </Text>

            {clue && <CluePills clue={clue} />}
          </View>

          <CodeSlots entry={code.entry} shakeSignal={code.shakeSignal} />
        </View>

        <Keypad
          entry={code.entry}
          onDigit={code.addDigit}
          onDelete={code.deleteDigit}
          onClear={code.clear}
        />

        <AttemptHistory
          attempts={player.attempts}
          targetLabel={isSolo ? 'Target: random code' : `Target: ${targetName}'s code`}
        />

        {!isSolo && <RelayStatus match={match} />}
      </View>

      <MatchMenu
        visible={menuOpen}
        isSolo={isSolo}
        onClose={() => setMenuOpen(false)}
        onGiveUp={giveUp}
        onEndMatch={endMatch}
        onLobby={() => router.replace('/')}
      />
    </Screen>
  );
}
