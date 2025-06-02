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
  const [slideAnim] = useState(new Animated.Value(100)); // 開始時在底部隱藏

  useEffect(() => {
    if (isVisible) {
      // 彈出動畫
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      // 隱藏動畫
      Animated.spring(slideAnim, {
        toValue: 100,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [isVisible, slideAnim]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
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
            size={24} 
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
            size={24} 
            color="#FFFFFF" 
          />
          <Text style={styles.buttonText}>管理教練</Text>
        </TouchableOpacity>

        {/* 中央裝飾點 */}
        <View style={styles.centerDot} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // 在工具欄上方
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  semicircle: {
    width: width * 0.8,
    height: 80,
    backgroundColor: '#00CED1',
    borderTopLeftRadius: (width * 0.8) / 2,
    borderTopRightRadius: (width * 0.8) / 2,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    padding: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  leftButton: {
    marginLeft: 10,
  },
  rightButton: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  centerDot: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default SemicirclePopup; 