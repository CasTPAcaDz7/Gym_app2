import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function FoodPhotoScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 請求相機和相簿權限
  useEffect(() => {
    (async () => {
      // 請求相機權限
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== 'granted') {
        Alert.alert('權限需求', '需要相機權限才能使用拍照功能');
      }

      // 請求相簿權限
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaLibraryPermission.status !== 'granted') {
        Alert.alert('權限需求', '需要相簿權限才能選擇照片');
      }
    })();
  }, []);

  // 拍照功能
  const takePhoto = async () => {
    try {
      setIsLoading(true);
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('拍照錯誤:', error);
      Alert.alert('錯誤', '拍照失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  // 選擇照片功能
  const pickImage = async () => {
    try {
      setIsLoading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('選擇照片錯誤:', error);
      Alert.alert('錯誤', '選擇照片失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  // 重新拍攝
  const retakePhoto = () => {
    setSelectedImage(null);
  };

  // 使用照片（暫時導航到添加食物頁面）
  const usePhoto = () => {
    if (selectedImage) {
      // 暫時先導航到添加食物頁面，之後可以添加食物辨識功能
      navigation.navigate('AddFood', {
        photoUri: selectedImage
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>📸 拍照記錄食物</Text>
        <Text style={styles.subtitle}>拍攝或選擇食物照片</Text>

        {/* 照片預覽區域 */}
        <View style={styles.photoContainer}>
          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <TouchableOpacity style={styles.overlayButton} onPress={retakePhoto}>
                  <MaterialCommunityIcons name="camera-retake" size={24} color="#ffffff" />
                  <Text style={styles.overlayButtonText}>重新拍攝</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialCommunityIcons name="camera" size={80} color="#A9A9A9" />
              <Text style={styles.placeholderText}>選擇照片</Text>
              <Text style={styles.placeholderSubtext}>拍照或從相簿選擇</Text>
            </View>
          )}
        </View>

        {/* 操作按鈕 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cameraButton]} 
            onPress={takePhoto}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="camera" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>拍照</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.galleryButton]} 
            onPress={pickImage}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="image" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>相簿</Text>
          </TouchableOpacity>
        </View>

        {/* 確認按鈕 */}
        {selectedImage && (
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={usePhoto}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="check" size={24} color="#ffffff" />
            <Text style={styles.confirmButtonText}>使用此照片</Text>
          </TouchableOpacity>
        )}

        {/* 載入指示器 */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00CED1" />
            <Text style={styles.loadingText}>處理中...</Text>
          </View>
        )}

        {/* 使用說明 */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📝 使用說明</Text>
          <Text style={styles.instructionText}>• 確保食物在照片中清晰可見</Text>
          <Text style={styles.instructionText}>• 避免陰影和反光</Text>
          <Text style={styles.instructionText}>• 盡量包含完整的食物</Text>
          <Text style={styles.instructionText}>• 目前為基本拍照功能，後續將添加智能辨識</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#A9A9A9',
    textAlign: 'center',
    marginBottom: 30,
  },

  // 照片容器樣式
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 15,
    overflow: 'hidden',
  },
  imagePreview: {
    width: 300,
    height: 300,
    borderRadius: 15,
  },
  imageOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  overlayButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  overlayButtonText: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 5,
  },
  placeholderContainer: {
    width: 300,
    height: 300,
    backgroundColor: '#2E3A3B',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4A5657',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#A9A9A9',
    marginTop: 10,
    fontWeight: '500',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },

  // 操作按鈕樣式
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 120,
    justifyContent: 'center',
  },
  cameraButton: {
    backgroundColor: '#4A90E2',
  },
  galleryButton: {
    backgroundColor: '#27AE60',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // 確認按鈕樣式
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00CED1',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 30,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // 載入樣式
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#A9A9A9',
    marginTop: 10,
    fontSize: 16,
  },

  // 說明文字樣式
  instructionsContainer: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00CED1',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 5,
    lineHeight: 20,
  },
}); 