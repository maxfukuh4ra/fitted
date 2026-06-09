// [GenAI Use] Prompt: import necessary libraries and components for rendering the save outfit bottom sheet with name input, visibility picker, and favorites toggle.
// [GenAI Use] Reflection: i looked at how TextInput and Modal were layered and understood the transparent input trick used for custom text rendering
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FontFamilies, Palette, Radius, Spacing, Typography } from '@/constants/design';

export type OutfitVisibility = 'Private' | 'Friends' | 'Public';

const VISIBILITY_OPTIONS: { value: OutfitVisibility; icon: string; label: string }[] = [
  { value: 'Private', icon: 'lock', label: 'Private' },
  { value: 'Friends', icon: 'people', label: 'Friends' },
  { value: 'Public', icon: 'public', label: 'Public' },
];

type Props = {
  visible: boolean;
  outfitName: string;
  addToFavorites: boolean;
  visibility: OutfitVisibility;
  selectedCollectionName: string | null;
  saving: boolean;
  saveError: string | null;
  onChangeName: (name: string) => void;
  onToggleFavorites: () => void;
  onChangeVisibility: (v: OutfitVisibility) => void;
  onOpenCollectionPicker: () => void;
  onSave: () => void;
  onClose: () => void;
};

export function SaveOutfitModal({
  visible,
  outfitName,
  addToFavorites,
  visibility,
  selectedCollectionName,
  saving,
  saveError,
  onChangeName,
  onToggleFavorites,
  onChangeVisibility,
  onOpenCollectionPicker,
  onSave,
  onClose,
}: Props) {
  const hasCollection = selectedCollectionName != null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Save Outfit</Text>
            <Pressable
              style={[styles.toggleBtn, styles.favBtn, addToFavorites && styles.toggleSelected]}
              onPress={onToggleFavorites}
            >
              <MaterialIcons
                name={addToFavorites ? 'favorite' : 'favorite-border'}
                size={18}
                color={addToFavorites ? Palette.error : Palette.onSurfaceVariant}
              />
              <Text style={styles.favText}>{addToFavorites ? 'Favorited' : 'Favorite'}</Text>
            </Pressable>
          </View>

          <View style={styles.nameInputWrap}>
            <Text
              pointerEvents="none"
              style={[styles.nameValueText, outfitName.length === 0 && styles.namePlaceholder]}
              numberOfLines={1}
            >
              {outfitName.length > 0 ? outfitName : 'Enter name (optional)'}
            </Text>
            <TextInput
              style={styles.nameInput}
              value={outfitName}
              onChangeText={onChangeName}
              maxLength={80}
              selectionColor={Palette.primary}
            />
          </View>

          <View style={styles.visibilityRow}>
            <Text style={styles.visibilityLabel}>Visibility</Text>
            <View style={styles.visibilityPicker}>
              {VISIBILITY_OPTIONS.map((opt) => {
                const active = visibility === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.visibilityBtn, active && styles.visibilityBtnActive]}
                    onPress={() => onChangeVisibility(opt.value)}
                    accessibilityLabel={opt.label}
                    hitSlop={4}
                  >
                    <MaterialIcons
                      name={opt.icon as 'lock' | 'people' | 'public'}
                      size={16}
                      color={active ? Palette.onPrimary : Palette.onSurfaceVariant}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            style={[styles.toggleBtn, hasCollection && styles.toggleSelected]}
            onPress={onOpenCollectionPicker}
          >
            <MaterialIcons
              name={hasCollection ? 'bookmark' : 'bookmark-border'}
              size={20}
              color={hasCollection ? Palette.primary : Palette.onSurfaceVariant}
            />
            <Text style={[styles.btnText, styles.collectionBtnText]} numberOfLines={1}>
              {hasCollection ? selectedCollectionName : 'Save to Collection'}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={Palette.onSurfaceVariant} />
          </Pressable>

          {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={onSave} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// [GenAI Use] AI was used to format and style these components using the theme, spacing, and design tokens from the constants folder.
// [GenAI Use] Reflection: i traced how the overlay and sheet styles create the bottom sheet effect and reviewed the visibility picker row layout
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.surfaceContainerLowest,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.containerMargin,
    gap: Spacing.stackMd,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Palette.outlineVariant,
    alignSelf: 'center',
    marginBottom: Spacing.stackSm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
    flex: 1,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
    height: 48,
    paddingHorizontal: Spacing.stackMd,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    borderRadius: Radius.md,
  },
  favBtn: {
    height: 32,
    gap: 6,
    paddingHorizontal: Spacing.stackSm,
    borderRadius: Radius.sm,
  },
  toggleSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.surfaceContainerLow,
  },
  btnText: {
    ...Typography.labelSm,
    color: Palette.onSurface,
  },
  collectionBtnText: {
    flex: 1,
    transform: [{ translateY: 2 }],
  },
  favText: {
    ...Typography.labelSm,
    color: Palette.onSurface,
    transform: [{ translateY: 1 }],
  },
  nameInputWrap: {
    height: 48,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  nameValueText: {
    fontFamily: FontFamilies.body,
    fontSize: 16,
    position: 'absolute',
    left: Spacing.stackMd,
    right: Spacing.stackMd,
    top: 13,
    color: Palette.onSurface,
  },
  namePlaceholder: {
    color: Palette.onSurfaceVariant,
  },
  nameInput: {
    fontFamily: FontFamilies.body,
    fontSize: 16,
    height: 48,
    color: 'transparent',
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visibilityLabel: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    textTransform: 'none',
    letterSpacing: 0,
  },
  visibilityPicker: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    overflow: 'hidden',
  },
  visibilityBtn: {
    paddingHorizontal: Spacing.stackSm,
    paddingVertical: 8,
    backgroundColor: Palette.surfaceContainerLow,
  },
  visibilityBtnActive: {
    backgroundColor: Palette.primary,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.stackMd,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.outline,
  },
  cancelBtnText: {
    ...Typography.labelSm,
    color: Palette.onSurface,
    transform: [{ translateY: 1 }],
  },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    ...Typography.labelSm,
    color: Palette.onPrimary,
    transform: [{ translateY: 1 }],
  },
});
