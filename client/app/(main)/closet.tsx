import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CategoryFilterBar } from '@/components/closet/category-filter-bar';
import { MainHeader } from '@/components/ui/main-header';
import { ClosetItemCard } from '@/components/closet/closet-item-card';
import { Palette, Spacing, Typography } from '@/constants/design';
import { useCloset } from '@/hooks/use-closet';
import type { ClosetItem } from '@/lib/types/closet';

export default function ClosetScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const {
    subcategoryFilters,
    selectedSubcategory,
    setSelectedSubcategory,
    filteredItems,
    loading,
    error,
  } = useCloset();

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
      <MainHeader />
      <FlatList
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
          { paddingBottom: tabBarHeight + Spacing.stackMd },
          filteredItems.length === 0 && styles.listContentEmpty,
        ]}
        columnWrapperStyle={filteredItems.length > 0 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  listContent: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackSm,
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
