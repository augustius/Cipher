import { Text, View } from 'react-native';

import { ordinal } from '@/game/format';
import { targetIndex } from '@/game/match';
import { rankPlayers } from '@/game/ranking';
import { Match, Player } from '@/game/types';

function statusLine(player: Player, place: number | undefined, targetName: string): string {
  if (player.status === 'solved') {
    return `Solved · ${ordinal(place ?? 0)} · skipped`;
  }

  if (player.status === 'dnf') {
    return 'Gave up · skipped';
  }

  return `Cracking ${targetName}`;
}

export function RelayStatus({ match }: { match: Match }) {
  const count = match.players.length;

  const places = new Map(rankPlayers(match.players).map((row) => [row.seat, row.place]));

  const solvedCount = match.players.filter((player) => player.status === 'solved').length;

  return (
    <View className="gap-3 rounded-2xl border border-line bg-raised p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-xs uppercase tracking-widest text-muted">Relay status</Text>

        <Text className="font-mono text-xs text-match">
          {solvedCount} solved / {count}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {match.players.map((player, seat) => {
          const isCurrent = seat === match.currentIndex;

          const targetName = match.players[targetIndex(seat, count)].name;

          const border = isCurrent ? 'border-accent' : 'border-line';

          const tone = player.status === 'solved' ? 'text-match' : 'text-muted';

          return (
            <View
              key={seat}
              className={`min-w-[47%] flex-1 gap-1 rounded-xl border bg-raised-high/40 p-3 ${border}`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-display text-base text-ink">{player.name}</Text>

                {isCurrent && <Text className="font-mono text-[10px] text-accent">NOW</Text>}
              </View>

              <Text className={`font-mono text-xs ${tone}`}>
                {statusLine(player, places.get(seat), targetName)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
