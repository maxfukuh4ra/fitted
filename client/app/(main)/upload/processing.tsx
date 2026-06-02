import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useEffect, useRef } from 'react';
import { Palette, Spacing, Radius, textVariants } from '@/constants/design';
import { useRouter } from 'expo-router';

export default function AIProcessingScreen() {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  //TODO: Replace makeApiCall with actual API call to process the image and return, then update contexdt
  const makeApiCall = () => new Promise(resolve => setTimeout(resolve, 3000));

  useEffect(() => {
    Animated.loop(
    Animated.sequence([
      Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])
    ).start();
    // Fake crawl to 80%
    Animated.timing(progressAnim, {
      toValue: 0.8,
      duration: 3000, 
      useNativeDriver: false,
    }).start();

    //DUMMY functions, replace with real
    makeApiCall().then(() => {
        Animated.timing(progressAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        }).start(() => router.replace('/upload/accept'));
    });
      }, [progressAnim, router]);

    const scanTranslateY = scanAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 128],
  });

  return (
    <View style={styles.container}>
      {/* Garment card */}
      <View style={styles.card}>
        <Image
        source={require('@/assets/images/hanger.png')}
        style={{ width: 48, height: 48, opacity: 0.4 }}
        />
        <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanTranslateY }] }]} />
        <View style={styles.fadeOverlay} />
      </View>

      {/* Text */}
      <View style={styles.textGroup}>
        <Text style={styles.heading}>Processing Your Item...</Text>
        <Text style={styles.subheading}>
          Our AI is removing the background to perfectly fit your wardrobe.
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.surfaceBright,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.containerMargin,
  },
  card: {
    width: 128,
    height: 176,
    backgroundColor: Palette.surfaceContainerLow,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.stackXl,
    overflow: 'hidden',
  },
  icon: {
    fontSize: 48,
    opacity: 0.4,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Palette.primary,
    opacity: 0.3,
  },
  fadeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: Palette.surfaceContainerLow,
    opacity: 0.05,
  },
  textGroup: {
    alignItems: 'center',
    gap: Spacing.stackSm,
    marginBottom: Spacing.stackXl,
  },
  heading: {
    ...textVariants.displayLg,
    color: Palette.onSurface,
    textAlign: 'center',
  },
  subheading: {
    ...textVariants.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
  },
  progressTrack: {
    width: 240,
    height: 2,
    backgroundColor: Palette.surfaceVariant,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.primary,
    borderRadius: Radius.full,
  },
});
