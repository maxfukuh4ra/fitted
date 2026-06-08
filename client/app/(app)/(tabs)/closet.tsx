// [GenAI Use] Prompt: "Import necessary libraries and components for the closet screen. 
// The closet screen should have a header, filterable chips, a list of items, and a footer.
// [GenAI Use] LLM Response Start
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  LayoutChangeEvent,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CategoryFilterBar } from '@/components/closet/category-filter-bar';
import { ClosetItemCard } from '@/components/closet/closet-item-card';
import { MainHeader } from '@/components/ui/main-header';
import { Palette, Spacing, Typography } from '@/constants/design';
import { useCloset } from '@/hooks/use-closet';
import type { ClosetItem } from '@/lib/types/closet';
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// After, seeing the initial output and testing it on my phone, I manually edited and removed components 
// that were not actively visible or meaningful to the user. I also followed up and created necessary components 
// (e.g. ClosetItemCard, MainHeader) that I created for this screen which was not from outside libraries. 

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ClosetItem>);

export default function ClosetScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerHeight, setHeaderHeight] = useState(0);
  const {
    subcategoryFilters,
    selectedSubcategory,
    setSelectedSubcategory,
    filteredItems,
    loading,
    refreshing,
    error,
    refresh,
  } = useCloset();

  // [GenAI Use] Prompt:
  // "As the user scrolls the closet grid, subtly shift the header up and fade in a divider
  // under it. Keep the effect small so it feels polished, not distracting."
  // [GenAI Use] LLM Response Start
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 48],
    outputRange: [0, -18],
    extrapolate: 'clamp',
  });

  const dividerOpacity = scrollY.interpolate({
    inputRange: [0, 32],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  // [GenAI Use] LLM Response End
  // [GenAI Use] Reflection:
  // I fine-tuned the input/output ranges after testing on my phone and found that smaller values felt snappier.
  // extrapolate: 'clamp' stops the header from drifting further once you scroll past the range.

  // [GenAI Use] Prompt:
  // "The header is absolutely positioned over the list. Measure its height on layout
  // and pad the list so the first row is not hidden underneath."
  // [GenAI Use] LLM Response Start
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setHeaderHeight((current) => (current === nextHeight ? current : nextHeight));
  };
  // [GenAI Use] LLM Response End
  // [GenAI Use] Reflection:
  // Without this padding the grid started under the header. I kept the equality guard
  // so layout does not trigger extra re-renders when the height has not changed for optimization.

  const listHeader = (
    <CategoryFilterBar
      filters={subcategoryFilters}
      selectedValue={selectedSubcategory}
      onSelect={setSelectedSubcategory}
    />
  );

  const listEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={Palette.primary} size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nothing here yet</Text>
        <Text style={styles.emptySubtitle}>
          {selectedSubcategory === null
            ? 'Add pieces to your closet to see them here.'
            : 'No items in this subcategory.'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      {/* [GenAI Use] Prompt:
          "Help me keep the header visible while the closet list scrolls underneath it." */}
      {/* [GenAI Use] LLM Response Start */}
      <Animated.View
        onLayout={handleHeaderLayout}
        pointerEvents="none"
        style={[
          styles.headerOverlay,
          {
            transform: [{ translateY: headerTranslateY }],
          },
        ]}>
        <MainHeader />
        <Animated.View style={[styles.headerDividerOverlay, { opacity: dividerOpacity }]} />
      </Animated.View>
      {/* [GenAI Use] LLM Response End */}
      {/* [GenAI Use] Reflection:
          I tested this on my phone and tweaked it so the header stayed in place
          without getting in the way of scrolling the item grid. */}
      <AnimatedFlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }: { item: ClosetItem }) => (
          <View style={styles.gridItem}>
            <ClosetItemCard item={item} />
          </View>
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.stackSm,
            paddingBottom: tabBarHeight + Spacing.stackMd,
          },
          filteredItems.length === 0 && styles.listContentEmpty,
        ]}
        columnWrapperStyle={filteredItems.length > 0 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        // [GenAI Use] Prompt:
        // "Connect list scrolling to the header animation so it moves smoothly as I scroll."
        // [GenAI Use] LLM Response Start
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        // [GenAI Use] LLM Response End
        // [GenAI Use] Reflection:
        // The first version felt choppy when scrolling the grid. After testing on my phone,
        // this setup made the header follow the list more smoothly.
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={Palette.primary}
            colors={[Palette.primary]}
          />
        }
      />
    </View>
  );
}

// [GenAI Use] Prompt: "Create styles for the closet screen according to the given HTML code. 
// Do not hard-code everything, pull from the constants/design.ts file for colors, fonts, etc."
// [GenAI Use] LLM Response Start
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  headerDividerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Palette.outline,
  },
  listContent: {
    paddingHorizontal: Spacing.containerMargin,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  row: {
    gap: Spacing.gutter,
    marginBottom: Spacing.gutter,
  },
  gridItem: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.stackXl,
    paddingHorizontal: Spacing.containerMargin,
    minHeight: 200,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
    textAlign: 'center',
  },
  emptyTitle: {
    ...Typography.titleLg,
    color: Palette.onSurface,
    textAlign: 'center',
    marginBottom: Spacing.stackSm,
  },
  emptySubtitle: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: 'center',
  },
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// The styles were created according to the given HTML code. After, seeing the initial output 
// and testing it on my phone, I manually edited and removed styles that were not actively visible 
// or meaningful to the user. 