import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Dimensions, Alert } from 'react-native';
import { getSavedPhotos, exportToCameraRoll } from './PhotoManager';

type Props = {
  onBack: () => void;
};

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth / numColumns;

export default function GalleryScreen({ onBack }: Props) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const uris = await getSavedPhotos();
    setPhotos(uris.reverse()); // latest first
  };

  const toggleSelection = (uri: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(uri)) {
      newSelected.delete(uri);
    } else {
      newSelected.add(uri);
    }
    setSelectedPhotos(newSelected);
  };

  const handleExport = async () => {
    if (selectedPhotos.size === 0) return;
    const urisToExport = Array.from(selectedPhotos);
    const success = await exportToCameraRoll(urisToExport);
    if (success) {
      Alert.alert("保存完了", `${urisToExport.length}枚の画像をカメラロールに保存しました！`);
      setSelectedPhotos(new Set()); // clear selection
    } else {
      Alert.alert("エラー", "画像の保存に失敗しました。");
    }
  };

  const handlePress = (uri: string) => {
    if (selectedPhotos.size > 0) {
      toggleSelection(uri);
    } else {
      setPreviewUri(uri);
    }
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = selectedPhotos.has(item);
    return (
      <TouchableOpacity 
        style={styles.imageContainer} 
        onPress={() => handlePress(item)}
        onLongPress={() => toggleSelection(item)}
      >
        <Image source={{ uri: item }} style={styles.image} />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (previewUri) {
    return (
      <View style={styles.previewContainer}>
        <TouchableOpacity style={styles.closePreviewButton} onPress={() => setPreviewUri(null)}>
          <Text style={styles.closePreviewText}>✕ 閉じる</Text>
        </TouchableOpacity>
        <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.navButton}>
          <Text style={styles.navButtonText}>◀ カメラへ</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ギャラリー</Text>
        <View style={styles.navButtonPlaceholder} />
      </View>

      {/* Grid */}
      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>画像がありません。</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item}
          numColumns={numColumns}
          renderItem={renderItem}
        />
      )}

      {/* Bottom Bar */}
      {selectedPhotos.size > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Text style={styles.exportButtonText}>
              選択した {selectedPhotos.size} 枚をカメラロールへ保存
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#222',
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    color: '#0d74ce',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButtonPlaceholder: {
    width: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    padding: 1,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 116, 206, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  checkmark: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  exportButton: {
    backgroundColor: '#0d74ce',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  closePreviewButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  closePreviewText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
