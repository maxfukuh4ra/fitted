import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Palette, Spacing, Radius, textVariants } from '@/constants/design';
import CategoryPicker from '@/components/upload/CategoryPicker';
import CategoryCard from '@/components/upload/CategoryCard';
import { router } from 'expo-router';
import { Category, SUBCATEGORIES } from '@/constants/categories';
import { useUpload } from '@/contexts/UploadContext';

type Props = {
  onBack?: () => void;
  onProfile?: () => void;
  onNav?: (tab: string) => void;
};

// Hard Coded Images, consider moving to S3 or bundle
const CATEGORY_IMAGES: Record<Category, string | undefined> = {
  [Category.Outerwear]: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbQxwpYTEfuXsYnRBmo-FXoGD4iFGIerElDgQf61cZl_1bgxJHW3oxRiGKcgL_UYB6YZvSKlidsxO6LDpBqlYlR4GfwMq28dpH0FSK_V61z2r-tCnmeW5O3Qd74YSYt2O6oBRQihZSEkKl04qjr5VEua_23hkOlhYdLLagQBxRvLwjFsLOwMyigVYK9G-NILbhw-Lqtgqp8T7KZqFOlEZ9RZPDma1ODUqKT9VPw3rbfU3v6At12VYnDVqDgwZnWoFc7mmDlueVSZQ',
  [Category.Tops]: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBjgCtmd2KhhkTIfxEaJVced2NohXHWgNLKmddyrVf_PonLRK_y25NqzELlyvOfFAz2UT-fSDIAVfN_87NmNh9tc5XmnbGby44fbWFHLnc5wMeAev8QqPlLuWgNgc_MkuCC7oCb_hNi1Q-eOk_PMv83DSW0PDa02FcEyQ2ijMYzRra-8C99UXQ76ZBoju2B_TJdw2q2_jtMf-S75mQxfdnxZncn3cB_eL87q9ANDs3CrH7R3ectAUKGGXJfFJgFKIgx_Fo-4Eh38s',
  [Category.Bottoms]: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjMUzTS_exGt9OCsKh7ASuLAGOafvs2Qn4DqhCAHqAfaylEHKLSAu3Evh5uOuEyQeb_4yHUPbuJvbMrLb5vePRloQP5_AEzw6C49vYtlxpoSeCN_TeuJK3ZfwpgY7tSwanaSlW2V_ukqpzbOa6LwZLpIG0I8JMkFhuAZYkz2CGwj0jxEEQZNJMho9MXNSa98a2-6rkrckx7byQT6IgQ4lhwIK2_anPaoswW0JlbQP3qncL2sL6by-gZKsZeH-Tj7F6L9QNLV1q4I4',
  [Category.Shoes]: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4m5rTTX24bd1S370LR8xLbvrzS_6vtwfQWiV9qjBX5qsKc93A5hONH9bnARpXpx1NA7gdDA5mMhumpsE0V3VbsF0s9mmEek1akFiDlpMseSEWfEC0Upnyz82kh-JWj_g0CfKOAqE8vdooCUYec8f4pTYSdOC7zBISZ2iajf_xY8zxyrFyZxP2iFFtJ2wMdzoZuBWLSOwPWxw2WrJFgyuX-VpVJW36Ut_3OW3OMYfdKge_P-Ie4aoyMVkY-aMzFe9nXp3QNt3XEYU',
  [Category.Accessories]: undefined,
};

export default function UploadCategoryScreen({ onBack, onProfile }: Props) {
  const CARD_HEIGHT = 200;
  const [picker, setPicker] = useState<Category | null>(null);
  const { setCategory } = useUpload();

  const openPicker = (cat: Category) => setPicker(cat);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surfaceContainerLowest} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn} activeOpacity={0.6}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.wordmark}>FITTED</Text>
        <TouchableOpacity onPress={onProfile} style={styles.headerBtn} activeOpacity={0.6}>
          <Text style={styles.headerIcon}>◯</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '25%' }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step header */}
        <View style={styles.stepHeader}>
          <Text style={[textVariants.labelSm, { color: Palette.onSurfaceVariant }]}>
            Step 1 of 4
          </Text>
          <Text style={[textVariants.displayLg, { color: Palette.onBackground, marginTop: Spacing.stackSm }]}>
            What are you uploading?
          </Text>
          <Text style={[textVariants.bodyMd, { color: Palette.onSurfaceVariant, marginTop: Spacing.stackSm }]}>
            Select a category to ensure your item is cataloged correctly with the right details.
          </Text>
        </View>

        {/* Row 1: Outerwear full-width */}
        <CategoryCard
          category={{
            id: Category.Outerwear,
            label: Category.Outerwear,
            sublabel: SUBCATEGORIES[Category.Outerwear].slice(0, 3).join(', '),
            image: CATEGORY_IMAGES[Category.Outerwear],
          }}
          onPress={() => openPicker(Category.Outerwear)}
          style={{ height: CARD_HEIGHT, marginBottom: Spacing.gutter }}
        />

        {/* Row 2: Tops | Bottoms */}
        <View style={{ flexDirection: 'row', gap: Spacing.gutter, marginBottom: Spacing.gutter }}>
          {([Category.Tops, Category.Bottoms] as const).map(cat => (
            <CategoryCard
              key={cat}
              category={{
                id: cat,
                label: cat,
                sublabel: SUBCATEGORIES[cat].slice(0, 3).join(', '),
                image: CATEGORY_IMAGES[cat],
              }}
              onPress={() => openPicker(cat)}
              style={{ flex: 1, height: CARD_HEIGHT }}
            />
          ))}
        </View>

        {/* Row 3: Shoes | Accessories */}
        <View style={{ flexDirection: 'row', gap: Spacing.gutter, marginBottom: Spacing.gutter }}>
          {([Category.Shoes, Category.Accessories] as const).map(cat => (
            <CategoryCard
              key={cat}
              category={{
                id: cat,
                label: cat,
                sublabel: SUBCATEGORIES[cat].slice(0, 3).join(', '),
                image: CATEGORY_IMAGES[cat],
              }}
              onPress={() => openPicker(cat)}
              disabled={cat === Category.Accessories}
              style={{ flex: 1, height: CARD_HEIGHT }}
            />
          ))}
        </View>
      </ScrollView>
      <CategoryPicker
        visible={!!picker}
        title={picker ?? ''}
        subcategories={picker ? SUBCATEGORIES[picker] : []}
        onNext={(sub) => {
          setPicker(null);
          setCategory(picker!, sub);
          console.log("Selected category:", picker, "subcategory:", sub);
          router.push('/upload/camera');
        }}
        onClose={() => setPicker(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.stackMd,
    backgroundColor: Palette.surfaceContainerLowest,
  },
  headerBtn: {
    padding: Spacing.stackSm,
    borderRadius: Radius.full,
  },
  headerIcon: {
    fontSize: 22,
    color: Palette.onSurface,
  },
  wordmark: {
    fontFamily: 'Newsreader_500Medium',
    fontSize: 20,
    letterSpacing: 4,
    color: Palette.onSurface,
  },
  progressTrack: {
    height: 3,
    backgroundColor: Palette.surfaceContainerHigh,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackXl,
    paddingBottom: Spacing.stackXl,
  },
  stepHeader: {
    marginBottom: Spacing.stackLg,
  },
});