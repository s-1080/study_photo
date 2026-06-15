import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Text, TouchableOpacity } from 'react-native';
import CameraScreen from './src/CameraScreen';
import GalleryScreen from './src/GalleryScreen';
import { hasExistingPhotos, deleteAllPhotos } from './src/PhotoManager';

type Screen = 'camera' | 'gallery';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('camera');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkExistingData();
  }, []);

  const checkExistingData = async () => {
    try {
      const exists = await hasExistingPhotos();
      if (exists) {
        Alert.alert(
          "前回の画像が残っています",
          "前回の授業の画像が残っています。削除して新しく始めますか？",
          [
            { 
              text: "そのまま残す", 
              style: "cancel",
              onPress: () => setIsReady(true)
            },
            { 
              text: "削除して始める", 
              style: "destructive",
              onPress: async () => {
                await deleteAllPhotos();
                setIsReady(true);
              }
            }
          ]
        );
      } else {
        setIsReady(true);
      }
    } catch (e) {
      console.error(e);
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'white'}}>準備中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {currentScreen === 'camera' && (
        <CameraScreen onGoToGallery={() => setCurrentScreen('gallery')} />
      )}
      {currentScreen === 'gallery' && (
        <GalleryScreen onBack={() => setCurrentScreen('camera')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
