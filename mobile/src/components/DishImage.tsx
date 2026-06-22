import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DISH_EMOJI } from '@/theme/tokens';

type Props = {
  category: string;
  height?: number;
  radius?: number;
  plateRatio?: number; // kept for API compatibility (unused in the green cover style)
  emojiSize?: number;
  style?: StyleProp<ViewStyle>;
};

// Green-tinted "cover" tile with a floating dish emoji — matches the green
// design's recipe-card cover (radial green-100 → green-50 → surface-2).
export function DishImage({ category, height = 138, radius = 0, emojiSize = 52, style }: Props) {
  return (
    <View style={[styles.wrap, { height, borderRadius: radius }, style]}>
      <LinearGradient
        colors={['#DCEDC8', '#F1F7E8', '#F3F1EA']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={[styles.emoji, { fontSize: Math.max(emojiSize, 44) }]}>
        {DISH_EMOJI[category] || '🍽️'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#ECEAE1' },
  emoji: {
    textShadowColor: 'rgba(31,49,16,0.18)',
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 16,
  },
});
