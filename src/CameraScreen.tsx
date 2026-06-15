import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { savePhotoToSandbox, deleteAllPhotos } from './PhotoManager';

type Props = {
  onGoToGallery: () => void;
};

export default function CameraScreen({ onGoToGallery }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(0);

  const toggleZoom = () => {
    setZoom((prev) => {
      if (prev === 0) return 0.15;
      if (prev === 0.15) return 0.35;
      if (prev === 0.35) return 0.45;
      if (prev === 0.45) return 0.55;
      return 0;
    });
  };

  const getZoomLabel = () => {
    if (zoom === 0) return '1.0x';
    if (zoom === 0.15) return '2.0x';
    if (zoom === 0.35) return '3.0x';
    if (zoom === 0.45) return '3.5x';
    return '4.0x';
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>カメラへのアクセスを許可してください</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>許可する</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        await savePhotoToSandbox(photo.uri);
      } catch (e) {
        console.error('Failed to take picture', e);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleEndClass = () => {
    Alert.alert(
      "授業終了",
      "保存されている全ての一時画像を削除します。よろしいですか？",
      [
        { text: "キャンセル", style: "cancel" },
        { 
          text: "削除する", 
          style: "destructive",
          onPress: async () => {
            await deleteAllPhotos();
            Alert.alert("削除完了", "画像データを全て削除しました！");
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="back"
        ref={cameraRef}
        zoom={zoom}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.endButton} onPress={handleEndClass}>
            <Text style={styles.endButtonText}>授業終了 (全削除)</Text>
          </TouchableOpacity>
        </View>

        {/* Zoom button */}
        <TouchableOpacity style={styles.zoomButton} onPress={toggleZoom}>
          <Text style={styles.zoomText}>{getZoomLabel()}</Text>
        </TouchableOpacity>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          {/* Empty view for spacing */}
          <View style={styles.flex1} />
          
          {/* Shutter button */}
          <View style={styles.flex1}>
            <TouchableOpacity 
              style={[styles.shutterButton, isProcessing && styles.shutterProcessing]} 
              onPress={takePicture}
              disabled={isProcessing}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          </View>

          {/* Gallery button */}
          <View style={[styles.flex1, styles.alignRight]}>
            <TouchableOpacity style={styles.galleryButton} onPress={onGoToGallery}>
              <Text style={styles.galleryButtonText}>ギャラリー</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  text: {
    color: '#fff',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0d74ce',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  endButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  flex1: {
    flex: 1,
    alignItems: 'center',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterProcessing: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  galleryButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
  },
  galleryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  zoomButton: {
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  zoomText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
