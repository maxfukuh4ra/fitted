  import React, { useState, useRef, useEffect } from 'react';
  import { MaterialCommunityIcons } from '@expo/vector-icons';
  import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Animated,
  } from 'react-native';
  import { router } from 'expo-router';
  import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
  import * as ImagePicker from 'expo-image-picker';
  import { Palette, Spacing, Radius } from '@/constants/design';
  import { useUpload } from '@/contexts/UploadContext';

  export default function CameraScreen() {
    const [flash, setFlash] = useState(false);
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const { setImage } = useUpload();
    const guidanceOpacity = useRef(new Animated.Value(1)).current;
    const isCapturing = useRef(false);

    const handleFlip = () => {
      setFacing(f => (f === 'back' ? 'front' : 'back'));
    };

    //pick from gallery and navigate to processing screen with image uri
    const handleGallery = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImage(uri); // save to context
        router.replace({ pathname: '/upload/processing', params: { uri } });
      }
    };

    //take picture and navigate to processing screen with image uri
    const handleShutter = async () => {
      if (!cameraRef.current || isCapturing.current) return;
      isCapturing.current = true;
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
        if (photo?.uri) {
          setImage(photo.uri);
          router.replace({ pathname: '/upload/processing', params: { uri: photo.uri } });
        }
      } finally {
        isCapturing.current = false;
      }
    };

    // Fade out guidance after 5 seconds
    useEffect(() => {
      const timer = setTimeout(() => {
        Animated.timing(guidanceOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 5000);
      return () => clearTimeout(timer);
    }, []);

    if (!permission?.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need access to your camera</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing={facing}
          flash={flash ? 'on' : 'off'}
        />
        <View style={styles.framingGuide} pointerEvents="none">
          <View style={styles.crosshairH} />
          <View style={styles.crosshairV} />
          <Animated.View style={[styles.guidancePill, { opacity: guidanceOpacity }]} pointerEvents="none">
            <Text style={styles.guidanceText}>
              Take a top-down photo with the clothing fully in frame and good lighting.
            </Text>
          </Animated.View>
        </View>

        <SafeAreaView style={styles.header}>
          <TouchableOpacity style={[styles.iconBtn, { marginLeft: 12 }]} onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { marginRight: 12 }]} onPress={() => setFlash(f => !f)} activeOpacity={0.8}>
            <MaterialCommunityIcons name={flash ? "flash" : "flash-off"} size={24} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.galleryBtn} onPress={handleGallery} activeOpacity={0.8}>
            <MaterialCommunityIcons name="image-multiple-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterOuter} onPress={handleShutter} activeOpacity={0.8}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.flipBtn} onPress={handleFlip} activeOpacity={0.8}>
            <MaterialCommunityIcons name="camera-flip-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    permissionContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Palette.background,
      gap: 16,
    },
    permissionText: {
      fontSize: 16,
      color: Palette.onSurface,
    },
    permissionBtn: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: Radius.lg,
      backgroundColor: Palette.primary,
    },
    permissionBtnText: {
      color: Palette.onPrimary,
      fontWeight: '600',
    },
    vignetteTop: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: '40%',
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    vignetteBottom: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: '45%',
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    framingGuide: {
      position: 'absolute',
      top: 130, left: 32, right: 32, bottom: 180,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      borderRadius: Radius.lg * 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    crosshairH: {
      position: 'absolute',
      width: 48, height: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    crosshairV: {
      position: 'absolute',
      width: 1, height: 48,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    header: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.containerMargin,
      paddingTop: 48,
    },
    iconBtn: {
      width: 48, height: 48,
      borderRadius: Radius.full,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    iconText: {
      fontSize: 20,
      color: '#fff',
    },
    guidancePill: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: Radius.full,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      marginHorizontal: 16,
      position: 'absolute',
      top: 16,
    },
    guidanceText: {
      color: '#fff',
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    bottomControls: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      paddingHorizontal: Spacing.containerMargin,
      paddingBottom: 48,
      paddingTop: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    galleryBtn: {
      width: 56, height: 56,
      borderRadius: Radius.lg,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    shutterOuter: {
      width: 80, height: 80,
      borderRadius: Radius.full,
      borderWidth: 3,
      borderColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    shutterInner: {
      width: 66, height: 66,
      borderRadius: Radius.full,
      backgroundColor: '#fff',
    },
    flipBtn: {
      width: 56, height: 56,
      borderRadius: Radius.full,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });