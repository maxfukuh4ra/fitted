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

  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setHeaderHeight((current) => (current === nextHeight ? current : nextHeight));
  };

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
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
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
