/*
GEN AI Usage Prompt: "Generate code to transition HTML example in React Native, using anything from 
from design.ts file"
// I added page logic, API Calls, etc. ontop

*/

import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Palette, Spacing, Radius, textVariants } from '@/constants/design';
import { useUpload } from '@/contexts/UploadContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { API } from '@/constants/api';
import { Category, CATEGORY_LABELS, SUBCATEGORIES } from '@/constants/categories';

export default function AcceptScreen() {
  const { imageUrl, category, subcategory } = useUpload();
  const [phase, setPhase] = useState<'confirm' | 'name'>('confirm');
  const [itemName, setItemName] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleConfirm = () => {
    setPhase('name');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSave = async () => {
    if (!imageUrl || !itemName.trim()) return;
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();

    try {
      const response = await fetch(API.uploadImage, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, category: category ? CATEGORY_LABELS[category] : null, subcategory, name: itemName.trim() }),
      });

      const data = await response.json();
      if (data.success) router.replace('/closet');
    } catch (e) {
      console.error('Confirm failed', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.imageCard}>
          <Image
            source={{ uri: imageUrl ?? undefined }}
            style={styles.image}
            contentFit="contain"
          />
        </View>

        {phase === 'confirm' ? (
          <>
            <View style={styles.textBlock}>
              <Text style={[textVariants.headlineMd, { color: Palette.onSurface }]}>
                Does this look right?
              </Text>
              <Text style={[textVariants.bodyMd, { color: Palette.onSurfaceVariant, marginTop: Spacing.stackSm }]}>
                Our AI has isolated your item. Confirm to add it to your closet.
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8} onPress={handleConfirm}>
                <Text style={[textVariants.labelSm, { color: Palette.onPrimary }]}>Looks Good</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.8} onPress={() => router.replace('/upload/camera')}>
                <Text style={[textVariants.labelSm, { color: Palette.onSurface }]}>Retake</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.actions}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Item Name"
                placeholderTextColor={Palette.onSurfaceVariant}
                value={itemName}
                onChangeText={setItemName}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.btnPrimary, (!itemName.trim() || saving) && styles.btnDisabled]}
                activeOpacity={0.8}
                onPress={handleSave}
                disabled={!itemName.trim() || saving}
              >
                <Text style={[textVariants.labelSm, { color: Palette.onPrimary }]}>
                  {saving ? 'Saving…' : 'Save to Closet'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.background,
    paddingHorizontal: Spacing.containerMargin,
    gap: Spacing.stackLg,
  },
  imageCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.lg * 2,
    backgroundColor: Palette.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.lg * 2,
  },
  textBlock: {
    alignItems: 'center',
  },
  actions: {
    width: '100%',
    gap: Spacing.stackMd,
  },
  input: {
    width: '100%',
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    paddingHorizontal: Spacing.gutter,
    backgroundColor: Palette.surfaceContainerLow,
    color: Palette.onSurface,
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
  },
  btnPrimary: {
    width: '100%',
    height: 52,
    backgroundColor: Palette.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondary: {
    width: '100%',
    height: 52,
    backgroundColor: 'transparent',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
});