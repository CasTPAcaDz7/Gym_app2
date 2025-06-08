import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  Animated,
  PanResponder,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PhotoCropScreen({ navigation, route }) {
  const { onPhotoSelect } = route.params;
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLayout, setImageLayout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 照片移動和縮放狀態
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  // 手勢狀態
  const [isScaling, setIsScaling] = useState(false);
  const [scaleValue, setScaleValue] = useState(1);
  const lastDistance = useRef(0);
  const currentScale = useRef(1);
  const currentTranslateX = useRef(0);
  const currentTranslateY = useRef(0);

  // 裁剪框尺寸（固定7:10比例）
  const cropFrameWidth = screenWidth * 0.9;
  const cropFrameHeight = cropFrameWidth * (10 / 7);

  useEffect(() => {
    selectPhoto();
  }, []);

  // 選擇照片
  const selectPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        setupImageLayout(result.assets[0]);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('選擇照片失敗:', error);
      Alert.alert('錯誤', '選擇照片失敗');
      navigation.goBack();
    }
  };

  // 設置照片布局
  const setupImageLayout = (imageInfo) => {
    const { width: imgWidth, height: imgHeight } = imageInfo;
    
    // 計算照片顯示尺寸（剛好填滿裁剪框）
    const imageAspectRatio = imgWidth / imgHeight;
    const cropAspectRatio = cropFrameWidth / cropFrameHeight;
    
    let displayWidth, displayHeight;
    
    if (imageAspectRatio > cropAspectRatio) {
      // 照片較寬，以高度為基準，確保高度填滿裁剪框
      displayHeight = cropFrameHeight;
      displayWidth = displayHeight * imageAspectRatio;
    } else {
      // 照片較高，以寬度為基準，確保寬度填滿裁剪框
      displayWidth = cropFrameWidth;
      displayHeight = displayWidth / imageAspectRatio;
    }

    const layout = {
      width: displayWidth,
      height: displayHeight,
      originalWidth: imgWidth,
      originalHeight: imgHeight,
    };

    setImageLayout(layout);
    setIsLoading(false);
  };

  // 計算兩點間距離
  const getDistance = (touches) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 計算邊界限制，確保裁剪框始終在照片內
  const getBoundaryLimits = (scale, imageLayout) => {
    if (!imageLayout) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    
    // 裁剪框中心位置
    const cropCenterX = screenWidth / 2;
    const cropCenterY = screenHeight / 2;
    
    // 縮放後的照片尺寸
    const scaledWidth = imageLayout.width * scale;
    const scaledHeight = imageLayout.height * scale;
    
    // 照片邊界相對於裁剪框中心的最大偏移
    const maxOffsetX = (scaledWidth - cropFrameWidth) / 2;
    const maxOffsetY = (scaledHeight - cropFrameHeight) / 2;
    
    return {
      minX: -Math.max(0, maxOffsetX),
      maxX: Math.max(0, maxOffsetX),
      minY: -Math.max(0, maxOffsetY),
      maxY: Math.max(0, maxOffsetY),
    };
  };

  // 限制移動範圍
  const constrainPosition = (x, y, scale, imageLayout) => {
    const limits = getBoundaryLimits(scale, imageLayout);
    return {
      x: Math.max(limits.minX, Math.min(limits.maxX, x)),
      y: Math.max(limits.minY, Math.min(limits.maxY, y)),
    };
  };

  // 計算最小縮放比例，確保照片始終能覆蓋裁剪框
  const getMinScale = (imageLayout) => {
    if (!imageLayout) return 0.3;
    
    // 計算照片需要多大縮放才能完全覆蓋裁剪框
    const scaleToFitWidth = cropFrameWidth / imageLayout.width;
    const scaleToFitHeight = cropFrameHeight / imageLayout.height;
    
    // 取較大的縮放比例，確保兩個方向都能覆蓋裁剪框
    const minScale = Math.max(scaleToFitWidth, scaleToFitHeight);
    
    console.log('最小縮放計算:', {
      cropFrameWidth,
      cropFrameHeight,
      imageWidth: imageLayout.width,
      imageHeight: imageLayout.height,
      scaleToFitWidth,
      scaleToFitHeight,
      minScale
    });
    
    return minScale;
  };

  // 手勢響應器
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    
    onPanResponderGrant: (evt) => {
      console.log('手勢開始，觸摸點數量:', evt.nativeEvent.touches.length);
      if (evt.nativeEvent.touches.length === 2) {
        // 雙指縮放開始
        setIsScaling(true);
        lastDistance.current = getDistance(evt.nativeEvent.touches);
        console.log('開始雙指縮放，初始距離:', lastDistance.current);
      } else {
        // 單指拖拽開始
        setIsScaling(false);
        console.log('開始單指拖拽');
      }
    },
    
    onPanResponderMove: (evt, gestureState) => {
      const touchCount = evt.nativeEvent.touches.length;
      
      if (touchCount === 2) {
        // 雙指縮放
        const currentDistance = getDistance(evt.nativeEvent.touches);
        
        if (lastDistance.current > 0) {
          const scaleFactor = currentDistance / lastDistance.current;
          const minScale = getMinScale(imageLayout);
          const targetScale = currentScale.current * scaleFactor;
          const newScale = Math.max(minScale, Math.min(3, targetScale));
          
          // 如果縮放被限制，需要重新計算基準距離以保持縮放連續性
          let adjustedDistance = currentDistance;
          if (targetScale < minScale) {
            // 縮放被限制到最小值，重新計算基準距離
            adjustedDistance = lastDistance.current * (minScale / currentScale.current);
            console.log('縮放被限制到最小值，調整基準距離:', {
              originalDistance: currentDistance,
              adjustedDistance,
              targetScale,
              minScale
            });
          } else if (targetScale > 3) {
            // 縮放被限制到最大值，重新計算基準距離
            adjustedDistance = lastDistance.current * (3 / currentScale.current);
            console.log('縮放被限制到最大值，調整基準距離:', {
              originalDistance: currentDistance,
              adjustedDistance,
              targetScale,
              maxScale: 3
            });
          }
          
          // 縮放時重新計算位置限制
          const constrainedPos = constrainPosition(
            currentTranslateX.current, 
            currentTranslateY.current, 
            newScale, 
            imageLayout
          );
          
          console.log('縮放中:', {
            currentDistance,
            lastDistance: lastDistance.current,
            scaleFactor,
            targetScale,
            newScale,
            constrainedX: constrainedPos.x,
            constrainedY: constrainedPos.y
          });
          
          scale.setValue(newScale);
          translateX.setValue(constrainedPos.x);
          translateY.setValue(constrainedPos.y);
          currentScale.current = newScale;
          currentTranslateX.current = constrainedPos.x;
          currentTranslateY.current = constrainedPos.y;
          setScaleValue(newScale);
          
          // 使用調整後的距離作為下次計算的基準
          lastDistance.current = adjustedDistance;
        } else {
          lastDistance.current = currentDistance;
        }
        
        if (!isScaling) {
          setIsScaling(true);
        }
      } else if (touchCount === 1 && !isScaling) {
        // 單指拖拽
        const newX = currentTranslateX.current + gestureState.dx;
        const newY = currentTranslateY.current + gestureState.dy;
        
        // 應用邊界限制
        const constrainedPos = constrainPosition(newX, newY, currentScale.current, imageLayout);
        
        console.log('拖拽中:', { 
          dx: gestureState.dx, 
          dy: gestureState.dy, 
          newX, 
          newY,
          constrainedX: constrainedPos.x,
          constrainedY: constrainedPos.y 
        });
        
        translateX.setValue(constrainedPos.x);
        translateY.setValue(constrainedPos.y);
      }
    },
    
    onPanResponderRelease: (evt, gestureState) => {
      console.log('手勢結束');
      
      // 最終檢查並限制位置
      const constrainedPos = constrainPosition(
        translateX._value, 
        translateY._value, 
        currentScale.current, 
        imageLayout
      );
      
      // 如果位置需要調整，平滑移動到合法位置
      if (constrainedPos.x !== translateX._value || constrainedPos.y !== translateY._value) {
        Animated.parallel([
          Animated.spring(translateX, { 
            toValue: constrainedPos.x, 
            useNativeDriver: true,
            tension: 100,
            friction: 8
          }),
          Animated.spring(translateY, { 
            toValue: constrainedPos.y, 
            useNativeDriver: true,
            tension: 100,
            friction: 8
          }),
        ]).start();
      }
      
      // 保存當前變換值
      currentTranslateX.current = constrainedPos.x;
      currentTranslateY.current = constrainedPos.y;
      setIsScaling(false);
    },
  });

  // 重置照片位置和縮放
  const resetImage = () => {
    currentScale.current = 1;
    currentTranslateX.current = 0;
    currentTranslateY.current = 0;
    setScaleValue(1);
    
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  // 執行裁剪
  const cropImage = async () => {
    if (!selectedImage || !imageLayout) return;

    try {
      // 裁剪框在螢幕上的位置
      const cropFrameCenterX = screenWidth / 2;
      const cropFrameCenterY = screenHeight / 2;
      
      // 照片中心位置（考慮變換）
      const imageCenterX = cropFrameCenterX + currentTranslateX.current;
      const imageCenterY = cropFrameCenterY + currentTranslateY.current;
      
      // 計算裁剪框左上角相對於照片中心的位置
      const cropLeft = cropFrameCenterX - cropFrameWidth / 2;
      const cropTop = cropFrameCenterY - cropFrameHeight / 2;
      
      // 轉換到照片座標系統
      const imageLeft = imageCenterX - (imageLayout.width * currentScale.current) / 2;
      const imageTop = imageCenterY - (imageLayout.height * currentScale.current) / 2;
      
      // 計算裁剪區域在縮放後照片中的位置
      const cropInImageX = (cropLeft - imageLeft) / currentScale.current;
      const cropInImageY = (cropTop - imageTop) / currentScale.current;
      const cropInImageWidth = cropFrameWidth / currentScale.current;
      const cropInImageHeight = cropFrameHeight / currentScale.current;
      
      // 轉換到原圖尺寸
      const scaleToOriginal = imageLayout.originalWidth / imageLayout.width;
      const finalCropX = Math.max(0, cropInImageX * scaleToOriginal);
      const finalCropY = Math.max(0, cropInImageY * scaleToOriginal);
      const finalCropWidth = Math.min(imageLayout.originalWidth - finalCropX, cropInImageWidth * scaleToOriginal);
      const finalCropHeight = Math.min(imageLayout.originalHeight - finalCropY, cropInImageHeight * scaleToOriginal);

      const result = await manipulateAsync(
        selectedImage.uri,
        [
          {
            crop: {
              originX: finalCropX,
              originY: finalCropY,
              width: finalCropWidth,
              height: finalCropHeight,
            },
          },
          {
            resize: {
              width: 700,
              height: 1000,
            },
          },
        ],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      onPhotoSelect(result.uri);
      navigation.goBack();
    } catch (error) {
      console.error('裁剪失敗:', error);
      Alert.alert('錯誤', '裁剪失敗，請重試');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>正在載入照片...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* 頂部控制欄 */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={resetImage}>
          <MaterialCommunityIcons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => {
            const minScale = getMinScale(imageLayout);
            const newScale = Math.max(minScale, Math.min(3, currentScale.current * 1.2));
            const constrainedPos = constrainPosition(
              currentTranslateX.current, 
              currentTranslateY.current, 
              newScale, 
              imageLayout
            );
            
            scale.setValue(newScale);
            translateX.setValue(constrainedPos.x);
            translateY.setValue(constrainedPos.y);
            currentScale.current = newScale;
            currentTranslateX.current = constrainedPos.x;
            currentTranslateY.current = constrainedPos.y;
            setScaleValue(newScale);
          }}
        >
          <Text style={styles.testButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => {
            const minScale = getMinScale(imageLayout);
            const newScale = Math.max(minScale, Math.min(3, currentScale.current * 0.8));
            const constrainedPos = constrainPosition(
              currentTranslateX.current, 
              currentTranslateY.current, 
              newScale, 
              imageLayout
            );
            
            scale.setValue(newScale);
            translateX.setValue(constrainedPos.x);
            translateY.setValue(constrainedPos.y);
            currentScale.current = newScale;
            currentTranslateX.current = constrainedPos.x;
            currentTranslateY.current = constrainedPos.y;
            setScaleValue(newScale);
          }}
        >
          <Text style={styles.testButtonText}>-</Text>
        </TouchableOpacity>
      </View>

      {/* 照片和裁剪框區域 */}
      <View style={styles.imageContainer} {...panResponder.panHandlers}>
        {selectedImage && imageLayout && (
          <Animated.Image
            source={{ uri: selectedImage.uri }}
            style={[
              styles.image,
              {
                width: imageLayout.width,
                height: imageLayout.height,
                transform: [
                  { translateX: translateX },
                  { translateY: translateY },
                  { scale: scale },
                ],
              },
            ]}
          />
        )}
        
        {/* 固定裁剪框 */}
        <View style={[styles.cropFrame, {
          width: cropFrameWidth,
          height: cropFrameHeight,
        }]}>
          {/* 裁剪框邊界 */}
          <View style={styles.cropBorder} />
          
          {/* 網格線 */}
          <View style={styles.gridLine1} />
          <View style={styles.gridLine2} />
          <View style={styles.gridLine3} />
          <View style={styles.gridLine4} />
          
          {/* 角落標記 */}
          <View style={[styles.cornerMark, styles.topLeft]} />
          <View style={[styles.cornerMark, styles.topRight]} />
          <View style={[styles.cornerMark, styles.bottomLeft]} />
          <View style={[styles.cornerMark, styles.bottomRight]} />
        </View>
      </View>

      {/* 底部控制欄 */}
      <View style={styles.bottomControls}>
        <Text style={styles.instructionText}>雙指縮放、單指拖拽</Text>
        <Text style={styles.scaleText}>縮放: {Math.round(scaleValue * 100)}%</Text>
        <Text style={styles.ratioText}>7:10 比例</Text>
        <TouchableOpacity style={styles.cropButton} onPress={cropImage}>
          <Text style={styles.cropButtonText}>確定裁剪</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    zIndex: 1000,
    elevation: 1000,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 206, 209, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 206, 209, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  image: {
    position: 'absolute',
  },
  cropFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00CED1',
    left: '50%',
    top: '50%',
    marginLeft: -(screenWidth * 0.9) / 2,
    marginTop: -(screenWidth * 0.9 * (10 / 7)) / 2,
  },
  cropBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderColor: '#00CED1',
  },
  gridLine1: {
    position: 'absolute',
    left: '33.33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0, 206, 209, 0.5)',
  },
  gridLine2: {
    position: 'absolute',
    left: '66.66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0, 206, 209, 0.5)',
  },
  gridLine3: {
    position: 'absolute',
    top: '33.33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 206, 209, 0.5)',
  },
  gridLine4: {
    position: 'absolute',
    top: '66.66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 206, 209, 0.5)',
  },
  cornerMark: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#00CED1',
    borderWidth: 3,
  },
  topLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  instructionText: {
    color: '#A9A9A9',
    fontSize: 14,
    marginBottom: 5,
  },
  scaleText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 5,
  },
  ratioText: {
    color: '#00CED1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cropButton: {
    backgroundColor: '#00CED1',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  cropButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 