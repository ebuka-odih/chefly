import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R } from '@/theme/tokens';
import { AppHeader } from './AppHeader';

export type LegalSection = { heading: string; body: string[] };

// Shared layout for the long-form legal pages (Privacy, Terms). Keeps a slim
// fixed nav bar up top and flows the policy sections beneath it.
export function LegalScreen({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <AppHeader variant="page" title={title} onBack={() => router.back()} />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: insets.bottom + 44 }}
      >
        <View style={styles.pill}>
          <Text style={styles.pillTxt}>Last updated · {updated}</Text>
        </View>

        {intro ? <Text style={styles.intro}>{intro}</Text> : null}

        {sections.map((s, i) => (
          <View key={s.heading} style={i === 0 ? styles.firstSection : styles.section}>
            <Text style={styles.heading}>{s.heading}</Text>
            {s.body.map((p, j) => (
              <Text key={j} style={[styles.para, j > 0 && { marginTop: 10 }]}>
                {p}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerTxt}>Chefly · Made with care 🌿</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', backgroundColor: C.saffronSoft, borderRadius: R.pill, paddingVertical: 6, paddingHorizontal: 14, marginTop: 6 },
  pillTxt: { fontFamily: F.sansSemi, fontSize: 12, color: C.green800 },
  intro: { fontFamily: F.sans, fontSize: 15, lineHeight: 23, color: C.ink2, marginTop: 16 },
  firstSection: { marginTop: 22 },
  section: { marginTop: 24 },
  heading: { fontFamily: F.sansBold, fontSize: 17, color: C.ink, letterSpacing: -0.2, marginBottom: 10 },
  para: { fontFamily: F.sans, fontSize: 14.5, lineHeight: 23, color: C.ink2 },
  footer: { alignItems: 'center', marginTop: 36 },
  footerTxt: { fontFamily: F.sansMed, fontSize: 13, color: C.ink3 },
});
