import { Pressable, Text, View } from 'react-native';

export interface SegmentOption<T> {
  value: T;
  label: string;
}

interface SegmentedProps<T> {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string | number>(props: SegmentedProps<T>) {
  const { label, options, value, onChange } = props;

  return (
    <View className="gap-2">
      <Text className="font-mono text-xs uppercase tracking-widest text-faint">{label}</Text>

      <View className="flex-row gap-2">
        {options.map((option) => {
          const isSelected = option.value === value;

          const tone = isSelected ? 'border-accent bg-accent/15' : 'border-line bg-raised';

          const text = isSelected ? 'text-accent' : 'text-muted';

          return (
            <Pressable
              key={String(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChange(option.value)}
              className={`flex-1 items-center rounded-xl border py-3 ${tone}`}
            >
              <Text className={`font-mono text-sm ${text}`}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
