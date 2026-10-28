import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '@/store/app-store';

const SOURCES = {
  tap: require('../../assets/sounds/tap.wav'),
  clue: require('../../assets/sounds/clue.wav'),
  solved: require('../../assets/sounds/solved.wav'),
  error: require('../../assets/sounds/error.wav'),
};

type SoundName = keyof typeof SOURCES;

// Players live for the whole app session, so they are created once and never released.
const players: Partial<Record<SoundName, AudioPlayer>> = {};

function playSound(name: SoundName): void {
  if (!useAppStore.getState().soundOn) {
    return;
  }

  const player = players[name] ?? createAudioPlayer(SOURCES[name]);

  players[name] = player;

  player.seekTo(0).then(() => player.play());
}

export function feedbackTap(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  playSound('tap');
}

export function feedbackClue(match: number): void {
  const style = match > 0 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium;

  Haptics.impactAsync(style);

  playSound('clue');
}

export function feedbackSolved(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  playSound('solved');
}

export function feedbackError(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  playSound('error');
}
