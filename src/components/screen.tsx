import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  footer?: ReactNode;
}

// Content is capped at a 480px column so the keypad stays in thumb reach on large phones.
export function Screen({ children, footer }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="w-full max-w-[480px] self-center px-4 pb-6"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {footer && (
        <View
          className="w-full max-w-[480px] self-center px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          {footer}
        </View>
      )}
    </View>
  );
}
