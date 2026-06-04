import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/design';

export type OutfitVisibility = 'private' | 'friends' | 'public';

const VISIBILITY_OPTIONS: { value: OutfitVisibility; label: string; icon: string }[] = [
  { value: 'private', label: 'Private', icon: 'lock' },
  { value: 'friends', label: 'Friends', icon: 'people' },
  { value: 'public', label: 'Public', icon: 'public' },
];

type Props = {
  visible: boolean;
  outfitName: string;
  addToFavorites: boolean;
  visibility: OutfitVisibility;
  saving: boolean;
  saveError: string | null;
  onChangeName: (name: string) => void;
  onToggleFavorites: () => void;
  onChangeVisibility: (v: OutfitVisibility) => void;
  onSave: () => void;
  onClose: () => void;
};

export function SaveOutfitModal({
  visible,
  outfitName,
  addToFavorites,
  visibility,
  saving,
  saveError,
  onChangeName,
  onToggleFavorites,
  onChangeVisibility,
  onSave,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Save Outfit</Text>

          <TextInput
            style={styles.nameInput}
            placeholder="Outfit name (optional)"
            placeholderTextColor={Palette.onSurfaceVariant}
            value={outfitName}
            onChangeText={onChangeName}
            maxLength={80}
            returnKeyType="done"
          />

          <Pressable style={styles.favRow} onPress={onToggleFavorites}>
            <MaterialIcons
              name={addToFavorites ? 'favorite' : 'favorite-border'}
              size={24}
              color={addToFavorites ? Palette.error : Palette.onSurface}
            />
            <Text style={styles.favLabel}>Add to Favorites</Text>
          </Pressable>

          <View style={styles.visibilityRow}>
            <Text style={styles.visibilityLabel}>Visibility</Text>
            <View style={styles.visibilityPicker}>
              {VISIBILITY_OPTIONS.map((opt) => {
                const active = visibility === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.visibilityOption, active && styles.visibilityOptionActive]}
                    onPress={() => onChangeVisibility(opt.value)}
                  >
                    <MaterialIcons
                      name={opt.icon as any}
                      size={16}
                      color={active ? Palette.onPrimary : Palette.onSurfaceVariant}
                    />
                    <Text style={[styles.visibilityOptionText, active && styles.visibilityOptionTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.collectionsRow}>
            <Text style={styles.collectionsLabel}>Save to Collection</Text>
            <Text style={styles.comingSoon}>Coming soon</Text>
          </View>

          {saveError && <Text style={styles.errorText}>{saveError}</Text>}

          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, saving && styles.confirmBtnDisabled]}
              onPress={onSave}
              disabled={saving}
            >
              <Text style={styles.confirmBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
  title: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
  },
  nameInput: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: Spacing.stackSm,
  },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackMd,
    paddingVertical: Spacing.stackSm,
  },
  favLabel: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
  visibilityRow: {
    gap: Spacing.stackSm,
    paddingVertical: Spacing.stackSm,
  },
  visibilityLabel: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
  visibilityPicker: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    overflow: 'hidden',
  },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.stackSm,
    backgroundColor: Palette.surfaceContainerLow,
  },
  visibilityOptionActive: {
    backgroundColor: Palette.primary,
  },
  visibilityOptionText: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
  },
  visibilityOptionTextActive: {
    color: Palette.onPrimary,
  },
  collectionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: Palette.outlineVariant,
  },
  collectionsLabel: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
  comingSoon: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.stackMd,
    paddingTop: Spacing.stackSm,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.stackMd,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.outline,
  },
  cancelBtnText: {
    ...Typography.titleLg,
    color: Palette.onSurface,
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.stackMd,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    ...Typography.titleLg,
    color: Palette.onPrimary,
  },
});
