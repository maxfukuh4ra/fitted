import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Palette, Spacing, Radius, textVariants } from '@/constants/design';
import CategoryPicker, { SubCategory } from '@/components/upload/CategoryPicker';
import CategoryCard, { Category } from '@/components/upload/CategoryCard';
import { router } from 'expo-router';

type Props = {
  onBack?: () => void;
  onProfile?: () => void;
  onSelectCategory?: (id: string) => void;
  onNav?: (tab: string) => void;
};

const SUBCATEGORIES: Record<string, SubCategory[]> = {
  outerwear: [
    { id: 'hoodie', label: 'Hoodie' },
    { id: 'zipup', label: 'Zip-up' },
    { id: 'coat', label: 'Coat' },
    { id: 'jacket', label: 'Jacket' },

    
  ],
  tops: [
    { id: 'tshirt', label: 'T-shirt' },
    { id: 'shirt', label: 'Shirt' },
    { id: 'knit', label: 'Knit / Sweater' },
    { id: 'tank', label: 'Tank Top' },
  ],
};

// Hardcode categoies, consider moving images to s3 supabase or bundle
const CATEGORIES: Category[] = [
  {
    id: 'outerwear',
    label: 'Outerwear',
    sublabel: 'Hoodie, Zip-up, Coat',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbQxwpYTEfuXsYnRBmo-FXoGD4iFGIerElDgQf61cZl_1bgxJHW3oxRiGKcgL_UYB6YZvSKlidsxO6LDpBqlYlR4GfwMq28dpH0FSK_V61z2r-tCnmeW5O3Qd74YSYt2O6oBRQihZSEkKl04qjr5VEua_23hkOlhYdLLagQBxRvLwjFsLOwMyigVYK9G-NILbhw-Lqtgqp8T7KZqFOlEZ9RZPDma1ODUqKT9VPw3rbfU3v6At12VYnDVqDgwZnWoFc7mmDlueVSZQ',
    wide: true,
  },
  {
    id: 'tops',
    label: 'Tops',
    sublabel: 'T-shirt, Shirt, Knit',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBjgCtmd2KhhkTIfxEaJVced2NohXHWgNLKmddyrVf_PonLRK_y25NqzELlyvOfFAz2UT-fSDIAVfN_87NmNh9tc5XmnbGby44fbWFHLnc5wMeAev8QqPlLuWgNgc_MkuCC7oCb_hNi1Q-eOk_PMv83DSW0PDa02FcEyQ2ijMYzRra-8C99UXQ76ZBoju2B_TJdw2q2_jtMf-S75mQxfdnxZncn3cB_eL87q9ANDs3CrH7R3ectAUKGGXJfFJgFKIgx_Fo-4Eh38s',
  },
  {
    id: 'bottoms',
    label: 'Bottoms',
    sublabel: 'Pants, Jeans, Shorts',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjMUzTS_exGt9OCsKh7ASuLAGOafvs2Qn4DqhCAHqAfaylEHKLSAu3Evh5uOuEyQeb_4yHUPbuJvbMrLb5vePRloQP5_AEzw6C49vYtlxpoSeCN_TeuJK3ZfwpgY7tSwanaSlW2V_ukqpzbOa6LwZLpIG0I8JMkFhuAZYkz2CGwj0jxEEQZNJMho9MXNSa98a2-6rkrckx7byQT6IgQ4lhwIK2_anPaoswW0JlbQP3qncL2sL6by-gZKsZeH-Tj7F6L9QNLV1q4I4',
    tall: true,
  },
  {
    id: 'shoes',
    label: 'Shoes',
    sublabel: 'Sneakers, Boots',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4m5rTTX24bd1S370LR8xLbvrzS_6vtwfQWiV9qjBX5qsKc93A5hONH9bnARpXpx1NA7gdDA5mMhumpsE0V3VbsF0s9mmEek1akFiDlpMseSEWfEC0Upnyz82kh-JWj_g0CfKOAqE8vdooCUYec8f4pTYSdOC7zBISZ2iajf_xY8zxyrFyZxP2iFFtJ2wMdzoZuBWLSOwPWxw2WrJFgyuX-VpVJW36Ut_3OW3OMYfdKge_P-Ie4aoyMVkY-aMzFe9nXp3QNt3XEYU',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    sublabel: 'Bags, Hats, Jewelry',
  },
];


export default function UploadCategoryScreen({
  onBack,
  onProfile,
  onSelectCategory,
}: Props) {

  const CARD_HEIGHT = 200;
  const [picker, setPicker] = useState<{ categoryId: string; title: string } | null>(null);

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

        {/* GRID Layout */}
        {/* Row 1: Outerwear full-width */}
        <CategoryCard
          category={CATEGORIES[0]}
          onPress={() => {
            const cat = CATEGORIES[0]; 
            setPicker({ categoryId: cat.id, title: cat.label });
          }}
          style={{ height: CARD_HEIGHT, marginBottom: Spacing.gutter }}
        />

        {/* Row 2: Tops | Bottoms */}
        <View style={{ flexDirection: 'row', gap: Spacing.gutter, marginBottom: Spacing.gutter }}>
          <CategoryCard
            category={CATEGORIES[1]}
            onPress={() => {
              const cat = CATEGORIES[1]; 
              setPicker({ categoryId: cat.id, title: cat.label });
            }}
            style={{ flex: 1, height: CARD_HEIGHT }}
          />
          <CategoryCard
            category={CATEGORIES[2]}
            onPress={() => {
              const cat = CATEGORIES[2]; 
              setPicker({ categoryId: cat.id, title: cat.label });
            }}
            style={{ flex: 1, height: CARD_HEIGHT }}
          />
        </View>

        {/* Row 3: Shoes | Accessories */}
        <View style={{ flexDirection: 'row', gap: Spacing.gutter, marginBottom: Spacing.gutter }}>
          <CategoryCard
            category={CATEGORIES[3]}
            onPress={() => {
              const cat = CATEGORIES[3]; 
              setPicker({ categoryId: cat.id, title: cat.label });
            }}
            style={{ flex: 1, height: CARD_HEIGHT }}
          />
          <CategoryCard
            category={CATEGORIES[4]}
            onPress={() => onSelectCategory?.(CATEGORIES[4].id)}
            style={{ flex: 1, height: CARD_HEIGHT }}
          />
        </View>
      </ScrollView>
      <CategoryPicker
        visible={!!picker}
        title={picker?.title ?? ''}
        subcategories={picker ? (SUBCATEGORIES[picker.categoryId] ?? []) : []}
        onNext={(sub) => {
          setPicker(null);
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

  // Header
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

  // Progress
  progressTrack: {
    height: 3,
    backgroundColor: Palette.surfaceContainerHigh,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.primary,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackXl,
    paddingBottom: Spacing.stackXl,
  },
  stepHeader: {
    marginBottom: Spacing.stackLg,
  },

  // Cards
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Palette.surfaceContainer,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.stackMd,
  },
  cardLabel: {
    color: Palette.onTertiary,
  },
  cardSublabel: {
    color: Palette.surfaceContainerHigh,
    marginTop: 4,
  },
  cardPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.stackMd,
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
  },
  cardIconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 20,
    color: Palette.onSurface,
    letterSpacing: 2,
  },

  // Bottom nav
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Palette.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: Palette.outlineVariant,
  },
  navTab: {
    alignItems: 'center',
    gap: 4,
  },
  navIcon: {
    fontSize: 20,
    color: Palette.onSurfaceVariant,
  },
  navIconActive: {
    color: Palette.primary,
  },
  navLabel: {
    fontSize: 9,
    color: Palette.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  navLabelActive: {
    color: Palette.primary,
  },
});
