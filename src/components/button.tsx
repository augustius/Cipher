import { Feather } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Pressable, Text } from 'react-native';

import colors from '@/theme/colors';

type IconName = ComponentProps<typeof Feather>['name'];

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
}

const CONTAINER = {
  primary: 'bg-accent',
  secondary: 'border border-line bg-raised',
  ghost: '',
};

const LABEL = {
  primary: 'text-on-accent',
  secondary: 'text-ink',
  ghost: 'text-muted',
};

const ICON_COLOR = {
  primary: colors['on-accent'],
  secondary: colors.ink,
  ghost: colors.muted,
};

export function Button({ label, onPress, variant = 'primary', icon, disabled }: ButtonProps) {
  const opacity = disabled ? 'opacity-40' : '';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center justify-center gap-2 rounded-xl px-4 py-4 active:scale-95 ${CONTAINER[variant]} ${opacity}`}
    >
      <Text className={`font-display text-base tracking-wide ${LABEL[variant]}`}>{label}</Text>

      {icon && <Feather name={icon} size={18} color={ICON_COLOR[variant]} />}
    </Pressable>
  );
}

interface IconButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
}

export function IconButton({ icon, label, onPress }: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={10}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-lg active:bg-raised"
    >
      <Feather name={icon} size={20} color={colors.muted} />
    </Pressable>
  );
}
