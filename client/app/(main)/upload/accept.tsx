import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Palette, Spacing, Radius, textVariants } from '@/constants/design';
import { useUpload } from '@/contexts/UploadContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { API } from '@/constants/api';

export default function AcceptScreen() {
  const { imageUri } = useUpload();

  const handleConfirm = async () => {
    if (!imageUri) return;

    const { data: { session } } = await supabase.auth.getSession();

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      } as any);

      const response = await fetch( API.uploadImage, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        router.replace('/closet');
      }
    } catch (e) {
      console.error('Upload failed', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Image card */}
      <View style={styles.imageCard}>
        <Image
          source={{ uri: imageUri ?? undefined }}
          style={styles.image}
          contentFit="contain"
        />
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={[textVariants.headlineMd, { color: Palette.onSurface }]}>
          Does this look right?
        </Text>
        <Text style={[textVariants.bodyMd, { color: Palette.onSurfaceVariant, marginTop: Spacing.stackSm }]}>
          Our AI has isolated your item. Confirm to add it to your closet.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8} onPress={handleConfirm}>
          <Text style={[textVariants.labelSm, { color: Palette.onPrimary }]}>Looks Good</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.8} onPress={() => router.replace('/upload/camera')}>
          <Text style={[textVariants.labelSm, { color: Palette.onSurface }]}>Retake</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: Spacing.stackMd,
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
});