import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SemicirclePopup = ({ isVisible, onChatPress, onCoachManagePress }) => {
  const [slideAnim] = useState(new Animated.Value(60)); // 開始時隱藏在底部工具欄後面

  useEffect(() => {
    if (isVisible) {
      // 彈出動畫 - 從底部工具欄後面彈出
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 120,
        friction: 7,
        duration: 300,
      }).start();
    } else {
      // 隱藏動畫 - 向下滑出畫面
      Animated.spring(slideAnim, {
        toValue: 120, // 向下滑出畫面
        useNativeDriver: true,
        tension: 100,
        friction: 8,
        duration: 280,
      }).start();
    }
  }, [isVisible, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: isVisible ? 1 : 0, // 添加透明度變化
        },
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'} // 當不可見時禁用點擊
    >
      {/* 半圓形背景 */}
      <View style={styles.semicircle}>
        {/* 左側按鈕 - 聊天室 */}
        <TouchableOpacity
          style={[styles.actionButton, styles.leftButton]}
          onPress={onChatPress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name="chat" 
            size={22} 
            color="#FFFFFF" 
          />
          <Text style={styles.buttonText}>聊天室</Text>
        </TouchableOpacity>

        {/* 右側按鈕 - 管理我的教練 */}
        <TouchableOpacity
          style={[styles.actionButton, styles.rightButton]}
          onPress={onCoachManagePress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name="account-supervisor" 
            size={22} 
            color="#FFFFFF" 
          />
          <Text style={styles.buttonText}>管理教練</Text>
        </TouchableOpacity>

        {/* 中央分隔線 */}
        <View style={styles.centerDivider} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70, // 緊貼在原工具欄上方
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  semicircle: {
    width: width, // 與螢幕同寬，匹配原工具欄
    height: 50, // 更窄的高度
    backgroundColor: '#00CED1',
    borderTopLeftRadius: width / 2, // 保持半圓形狀
    borderTopRightRadius: width / 2,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', // 均勻分佈按鈕
    paddingHorizontal: 60, // 調整內邊距
    paddingTop: 8,
    paddingBottom: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    // 添加邊框效果，與原工具欄呼應
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 10,
    minWidth: 90,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    // 添加內陰影效果
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  leftButton: {
    marginRight: 20,
  },
  rightButton: {
    marginLeft: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  centerDivider: {
    position: 'absolute',
    top: 15,
    left: '50%',
    marginLeft: -0.5,
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});

export default SemicirclePopup; 