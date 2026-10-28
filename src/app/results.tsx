import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';
import { CluePills } from '@/components/clue-pills';
import { DigitRow } from '@/components/digit-box';
import { Screen } from '@/components/screen';
import { formatDuration, ordinal, plural } from '@/game/format';
import { targetIndex } from '@/game/match';
import { RankedPlayer, rankPlayers } from '@/game/ranking';
import { Match } from '@/game/types';
import { routeFor } from '@/navigation/routes';
import { useAppStore } from '@/store/app-store';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-xl border border-line bg-raised p-3">
      <Text className="font-mono text-[10px] uppercase tracking-widest text-faint">{label}</Text>

      <Text className="font-display text-lg text-ink">{value}</Text>
    </View>
  );
}

function StandingRow({ row, match }: { row: RankedPlayer; match: Match }) {
  const { player, place } = row;

  const count = match.players.length;

  const targetName = match.players[targetIndex(row.seat, count)].name;

  const isSolved = player.status === 'solved';

  const isWinner = isSolved && place === 1;

  const border = isWinner ? 'border-accent' : 'border-line';

  const detail = isSolved
    ? `Cracked ${targetName}'s code in round ${player.solvedRound}`
    : `Did not finish ${targetName}'s code`;

  return (
    <View className={`gap-3 rounded-2xl border bg-raised p-4 ${border}`}>
      <View className="flex-row items-center gap-3">
        <Text className="w-12 rounded-lg border border-line py-2 text-center font-display text-sm text-ink">
          {isSolved ? ordinal(place) : 'DNF'}
        </Text>

        <View className="flex-1">
          <Text className="font-display text-lg text-ink">{player.name}</Text>

          <Text className="font-body text-xs text-muted">{detail}</Text>
        </View>

        {isWinner && <Text className="font-mono text-xs text-match">WINNER</Text>}
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-xs text-faint">
          {plural(row.guessCount, 'guess')} · {plural(row.timeoutCount, 'timeout')} ·{' '}
          {formatDuration(player.thinkingMs)}
        </Text>

        {!isSolved && row.bestClue && <CluePills clue={row.bestClue} />}
      </View>
    </View>
  );
}

function CodeReveal({ match }: { match: Match }) {
  const count = match.players.length;

  return (
    <View className="gap-3">
      <Text className="font-display text-lg text-ink">Secret Codes Revealed</Text>

      {match.players.map((player, seat) => {
        const cracker = match.players[(seat - 1 + count) % count];

        const wasCracked = cracker.status === 'solved';

        return (
          <View key={seat} className="gap-2 rounded-2xl border border-line bg-raised p-4">
            <View className="flex-row justify-between">
              <Text className="font-mono text-sm text-ink">{player.name}&apos;s code</Text>

              <Text className={`font-mono text-xs ${wasCracked ? 'text-match' : 'text-faint'}`}>
                {wasCracked ? `Cracked by ${cracker.name}` : 'Not cracked'}
              </Text>
            </View>

            <DigitRow digits={player.code ?? '----'} size="lg" />
          </View>
        );
      })}
    </View>
  );
}

function SoloSummary({ match }: { match: Match }) {
  const soloBest = useAppStore((state) => state.soloBest);

  const [row] = rankPlayers(match.players);

  const isSolved = row.player.status === 'solved';

  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <Stat label="Guesses" value={String(row.guessCount)} />

        <Stat label="Time" value={formatDuration(row.player.thinkingMs)} />
      </View>

      {soloBest && (
        <Text className="text-center font-mono text-xs text-muted">
          Personal best: {plural(soloBest.attempts, 'guess')} · {formatDuration(soloBest.ms)}
        </Text>
      )}

      <View className="items-center gap-3 rounded-2xl border border-line bg-raised p-4">
        <Text className="font-mono text-xs uppercase tracking-widest text-faint">
          {isSolved ? 'The code was' : 'You gave up. The code was'}
        </Text>

        <DigitRow digits={row.player.code ?? '----'} size="lg" />
      </View>
    </View>
  );
}

export default function Results() {
  const match = useAppStore((state) => state.match);

  const playAgain = useAppStore((state) => state.playAgain);

  const discardMatch = useAppStore((state) => state.discardMatch);

  if (!match || match.phase !== 'finished') {
    return <Redirect href={routeFor(match)} />;
  }

  const isSolo = match.config.mode === 'solo';

  const ranked = rankPlayers(match.players);

  const winner = ranked[0].player.status === 'solved' ? ranked[0].player : null;

  const totalMs = match.players.reduce((sum, player) => sum + player.thinkingMs, 0);

  const totalGuesses = ranked.reduce((sum, row) => sum + row.guessCount, 0);

  const headline = winner ? (isSolo ? 'Code Cracked!' : `${winner.name} Wins!`) : 'Match Over';

  const again = () => {
    playAgain();

    router.replace(isSolo ? '/game' : '/setup');
  };

  const newGame = () => {
    discardMatch();

    router.replace('/');
  };

  const footer = (
    <View className="gap-3">
      <Button label="New Game" variant="secondary" icon="users" onPress={newGame} />

      <Button label="Play Again" icon="rotate-cw" onPress={again} />
    </View>
  );

  return (
    <Screen footer={footer}>
      <View className="items-center gap-2 py-8">
        <Text className="font-mono text-xs uppercase tracking-widest text-match">
          Match complete
        </Text>

        <Text className="font-display text-4xl text-ink">{headline}</Text>
      </View>

      {isSolo ? (
        <SoloSummary match={match} />
      ) : (
        <View className="gap-5">
          <View className="flex-row gap-3">
            <Stat label="Rounds" value={String(match.round)} />

            <Stat label="Time" value={formatDuration(totalMs)} />

            <Stat label="Guesses" value={String(totalGuesses)} />
          </View>

          <Text className="font-display text-lg text-ink">Final Standings</Text>

          {ranked.map((row) => (
            <StandingRow key={row.seat} row={row} match={match} />
          ))}

          <CodeReveal match={match} />
        </View>
      )}
    </Screen>
  );
}
