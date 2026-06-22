import { View, Text, StyleSheet } from 'react-native';
import { Wheat, Droplet, Candy, Egg, Flame } from 'lucide-react-native';
import { C, F, R } from '@/theme/tokens';

type MacroType = 'carbs' | 'fats' | 'sugar' | 'protein' | 'calories';

const META: Record<MacroType, { color: string; tint: string; Icon: any; label: string }> = {
  carbs: { color: C.carb, tint: 'rgba(124,179,66,0.16)', Icon: Wheat, label: 'Carbs' },
  fats: { color: C.fat, tint: 'rgba(255,167,38,0.16)', Icon: Droplet, label: 'Fats' },
  sugar: { color: C.sugar, tint: 'rgba(239,83,80,0.16)', Icon: Candy, label: 'Sugar' },
  protein: { color: C.protein, tint: 'rgba(66,165,245,0.16)', Icon: Egg, label: 'Protein' },
  calories: { color: C.green700, tint: 'rgba(124,179,66,0.16)', Icon: Flame, label: 'Calories' },
};

export function MacroBadge({ type = 'carbs', value, label }: { type?: MacroType; value: string; label?: string }) {
  const m = META[type] || META.carbs;
  const Icon = m.Icon;
  return (
    <View style={styles.badge}>
      <View style={[styles.ico, { backgroundColor: m.tint }]}>
        <Icon size={17} color={m.color} strokeWidth={2.4} />
      </View>
      <Text style={styles.val}>{value}</Text>
      <Text style={styles.label}>{label || m.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 6, backgroundColor: C.surface2, borderRadius: R.lg },
  ico: { width: 30, height: 30, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center' },
  val: { fontFamily: F.heavy, fontSize: 17, color: C.ink, letterSpacing: -0.4 },
  label: { fontFamily: F.sansMed, fontSize: 11.5, color: C.ink3 },
});
