import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

const PHOTO_DIR = FileSystem.documentDirectory + 'study_photos/';

// Initialize directory
export const initDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
  }
};

// Check if there are existing photos (for alert on startup)
export const hasExistingPhotos = async (): Promise<boolean> => {
  await initDirectory();
  const files = await FileSystem.readDirectoryAsync(PHOTO_DIR);
  return files.length > 0;
};

// Get all saved photos
export const getSavedPhotos = async (): Promise<string[]> => {
  await initDirectory();
  const files = await FileSystem.readDirectoryAsync(PHOTO_DIR);
  // Return full URIs
  return files.map(file => PHOTO_DIR + file);
};

// Move temp photo from cache to our app document directory
export const savePhotoToSandbox = async (tempUri: string): Promise<string> => {
  await initDirectory();
  const filename = `photo_${Date.now()}.jpg`;
  const destUri = PHOTO_DIR + filename;
  
  await FileSystem.moveAsync({
    from: tempUri,
    to: destUri,
  });
  
  return destUri;
};

// Delete all photos in the directory
export const deleteAllPhotos = async () => {
  const files = await FileSystem.readDirectoryAsync(PHOTO_DIR);
  for (const file of files) {
    await FileSystem.deleteAsync(PHOTO_DIR + file, { idempotent: true });
  }
};

// Export selected photos to device Camera Roll
export const exportToCameraRoll = async (uris: string[]): Promise<boolean> => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('カメラロールへの保存権限が必要です！');
    return false;
  }

  try {
    for (const uri of uris) {
      await MediaLibrary.createAssetAsync(uri);
    }
    return true;
  } catch (error) {
    console.error('Export failed', error);
    return false;
  }
};
