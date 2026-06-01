import { StyleSheet, Text, View, Alert, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { Palette, Spacing, Typography } from '@/constants/design';
import { useState } from 'react';

export default function UploadScreen() {
  //CODE BELOW IS DUMMY CODE FOR TESTING UPLOADS, JUST UPLOADS PHOTO WITHOUT CLEANING
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function handleUpload() {
  const result = await ImagePicker.launchImageLibraryAsync({});
  if (result.canceled || !result.assets[0].uri) return;

  setLoading(true);
  const { data: { session } } = await supabase.auth.getSession();
  console.log('session:', session);
  
  try {
    const imageResponse = await fetch(result.assets[0].uri);
    const blob = await imageResponse.blob();

    const formData = new FormData();
    formData.append('image', blob, 'upload.jpg');
    formData.append('category', 'tops');

    const response = await fetch('http://localhost:3000/api/process-image', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session?.access_token}` },
      body: formData
    });
    const data = await response.json();
    console.log('response from server:', data);
    Alert.alert(data.success ? 'Success' : 'Error');
  } catch (e) {
    setError('Upload failed');
  } finally {
    setLoading(false);
  }
  }
  //END OF DUMMY CODE

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <Text style={styles.title}>Upload</Text>
        <Button title={loading ? 'Uploading...' : 'Upload'} onPress={handleUpload} disabled={loading} />
        {error && <Text>{error}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.containerMargin,
  },
  title: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
  },
});
