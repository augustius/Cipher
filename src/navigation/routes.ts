import { Href } from 'expo-router';

import { Match } from '@/game/types';

export function routeFor(match: Match | null): Href {
  if (!match) {
    return '/';
  }

  const routes = { setup: '/setup', playing: '/game', finished: '/results' } as const;

  return routes[match.phase];
}
