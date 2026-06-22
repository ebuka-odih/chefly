import { ReactNode, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { C, F, R, SHADOW } from '@/theme/tokens';

// Round icon button (icon-btn round) — surface tile, soft shadow.
export function IconBtn({
  children,
  onPress,
  style,
  dot,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  dot?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.iconBtn, pressed && { transform: [{ scale: 0.94 }] }, style]}
    >
      {children}
      {dot && <View style={styles.badgeDot} />}
    </Pressable>
  );
}

type Props = {
  variant?: 'home' | 'page' | 'title';
  title?: string;
  accent?: string; // green-highlighted trailing word (home)
  greeting?: string;
  subtitle?: string;
  onBack?: () => void;
  left?: ReactNode; // leading slot — overrides the default back chevron when provided
  right?: ReactNode;
};

export function AppHeader({ variant = 'page', title, accent, greeting, subtitle, onBack, left, right }: Props) {
  const insets = useSafeAreaInsets();
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 450, delay: 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [enter]);
  const greetStyle = {
    opacity: enter,
    transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  };

  if (variant === 'title') {
    return (
      <View style={[styles.wrap, { paddingTop: insets.top + 18 }]}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bigTitle}>{title}</Text>
            {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
          </View>
          {right ? <View style={styles.actions}>{right}</View> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 12 }]}>
      <View style={styles.row}>
        {left ? (
          left
        ) : variant === 'page' ? (
          <IconBtn onPress={onBack}>
            <ChevronLeft size={22} color={C.ink} strokeWidth={2.4} />
          </IconBtn>
        ) : null}

        {variant === 'page' && title ? <Text style={styles.pageTitle}>{title}</Text> : <View style={{ flex: 1 }} />}

        <View style={styles.actions}>{right}</View>
      </View>

      {variant === 'home' && (
        <Animated.View style={[styles.greeting, greetStyle]}>
          {greeting ? <Text style={styles.hello}>{greeting}</Text> : null}
          {title ? (
            <Text style={styles.bigTitle}>
              {title}
              {accent ? <Text style={styles.accent}> {accent}</Text> : null}
            </Text>
          ) : null}
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46 },
  pageTitle: { flex: 1, textAlign: 'center', fontFamily: F.sansBold, fontSize: 17, color: C.ink },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { marginTop: 16 },
  hello: { fontFamily: F.sansSemi, fontSize: 14, color: C.ink3, marginBottom: 3 },
  bigTitle: { fontFamily: F.heavy, fontSize: 28, color: C.ink, letterSpacing: -0.7, lineHeight: 32 },
  accent: { color: C.green600 },
  sub: { marginTop: 6, fontFamily: F.sans, fontSize: 14, color: C.ink2 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, minHeight: 46 },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: R.pill,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  badgeDot: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: C.green, borderWidth: 2, borderColor: C.surface },
});
