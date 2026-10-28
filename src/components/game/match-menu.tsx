import { Modal, Pressable, Text } from 'react-native';

import { Button } from '@/components/button';

interface MatchMenuProps {
  visible: boolean;
  isSolo: boolean;
  onClose: () => void;
  onGiveUp: () => void;
  onEndMatch: () => void;
  onLobby: () => void;
}

// A modal rather than Alert, because Android alerts cap out at three buttons.
export function MatchMenu(props: MatchMenuProps) {
  const { visible, isSolo, onClose, onGiveUp, onEndMatch, onLobby } = props;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/70 p-4" onPress={onClose}>
        <Pressable className="w-full max-w-[480px] gap-3 self-center rounded-2xl border border-line bg-surface p-4">
          <Text className="pb-1 font-mono text-xs uppercase tracking-widest text-faint">
            Match menu
          </Text>

          <Button label="Give up this code" icon="flag" variant="secondary" onPress={onGiveUp} />

          {!isSolo && (
            <Button
              label="End match now"
              icon="x-octagon"
              variant="secondary"
              onPress={onEndMatch}
            />
          )}

          <Button label="Back to lobby (keeps match)" variant="secondary" onPress={onLobby} />

          <Button label="Close" variant="ghost" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
