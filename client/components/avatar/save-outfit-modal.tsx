import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FontFamilies, Palette, Radius, Spacing, Typography } from '@/constants/design';

type Props = {
  visible: boolean;
  outfitName: string;
  addToFavorites: boolean;
  saveToCollection: boolean;
  saving: boolean;
  saveError: string | null;
  onChangeName: (name: string) => void;
  onToggleFavorites: () => void;
  onToggleSaveToCollection: () => void;
  onSave: () => void;
  onClose: () => void;
};

export function SaveOutfitModal({
  visible,
  outfitName,
  addToFavorites,
  saveToCollection,
  saving,
  saveError,
  onChangeName,
  onToggleFavorites,
  onToggleSaveToCollection,
  onSave,
  onClose,
}: Props) {
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

          <Pressable
            style={[styles.toggleBtn, saveToCollection && styles.toggleSelected]}
            onPress={onToggleSaveToCollection}
          >
            <MaterialIcons
              name={saveToCollection ? 'bookmark' : 'bookmark-border'}
              size={20}
              color={saveToCollection ? Palette.primary : Palette.onSurfaceVariant}
            />
            <Text style={styles.btnText}>Save to Collection</Text>
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
