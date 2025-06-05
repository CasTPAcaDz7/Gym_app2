import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CommunityScreen({ navigation }) {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [isCoachMode, setIsCoachMode] = useState(false); // 新增：模式切換狀態，false為學生模式，true為教練模式
  
  // 動畫值用於開關掣
  const switchAnimation = useRef(new Animated.Value(0)).current;
  
  // 用戶資料 - 從AsyncStorage讀取
  const [userData, setUserData] = useState({
    name: '王小明',
    avatar: 'account-circle',
    role: '健身愛好者',
    level: '中級',
    joinDate: '2024-01-15',
  });

  // 功能欄數據（原教練類別改為功能欄）
  const functions = [
    { id: 1, name: '尋找教練', icon: 'account-search', color: '#00CED1' },
    { id: 2, name: '管理教練', icon: 'account-tie', color: '#FF6B6B' },
    { id: 3, name: 'Forum', icon: 'forum', color: '#4CAF50' },
  ];

  // 教練模式功能欄
  const coachFunctions = [
    { id: 1, name: '我的學生', icon: 'account-group', color: '#00CED1' },
    { id: 2, name: '課程管理', icon: 'calendar-clock', color: '#FF6B6B' },
    { id: 3, name: '收入統計', icon: 'chart-line', color: '#4CAF50' },
  ];

  // 模擬學生數據（教練模式用）
  const mockStudents = [
    {
      id: 1,
      name: '張小明',
      level: '初學者',
      joinDate: '2024-03-15',
      lastSession: '2024-05-28',
      totalSessions: 12,
      goal: '減重',
      progress: 75,
    },
    {
      id: 2,
      name: '李小美',
      level: '中級',
      joinDate: '2024-02-10',
      lastSession: '2024-05-30',
      totalSessions: 24,
      goal: '增肌',
      progress: 85,
    },
    {
      id: 3,
      name: '王大力',
      level: '高級',
      joinDate: '2024-01-05',
      lastSession: '2024-06-01',
      totalSessions: 48,
      goal: '體能提升',
      progress: 90,
    },
  ];

  useEffect(() => {
    loadUserData();
    
    // 添加focus監聽器，當頁面獲得焦點時重新載入用戶資料
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const userProfileData = await AsyncStorage.getItem('userProfile');
      if (userProfileData) {
        const parsedData = JSON.parse(userProfileData);
        setUserData(prevData => ({
          ...prevData,
          name: parsedData.name || prevData.name,
          avatar: parsedData.avatar || prevData.avatar,
        }));
      }
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    }
  };

  // 處理功能選擇
  const handleFunctionSelect = (func) => {
    setSelectedFunction(func.id);
    
    if (func.name === '尋找教練') {
      // 實際應用中這裡會調用API搜索教練
      console.log('Searching for coaches...');
    } else if (func.name === '管理教練') {
      console.log('Navigate to Coach Management');
    } else if (func.name === 'Forum') {
      handleForumPress();
    }
  };

  // 處理論壇按鈕點擊
  const handleForumPress = () => {
    // 跳轉到論壇頁面
    console.log('Navigate to Forum');
  };

  // 處理聊天室按鈕點擊
  const handleChatPress = () => {
    // 跳轉到聊天室頁面
    console.log('Navigate to Chat Room');
  };

  // 個人資訊按鈕處理函數
  const handleUserProfilePress = () => {
    navigation.navigate('Profile');
  };

  // 模式切換處理函數
  const handleModeToggle = () => {
    const newMode = !isCoachMode;
    setIsCoachMode(newMode);
    setSelectedFunction(null); // 切換模式時重置選中的功能
    
    // 動畫切換
    Animated.spring(switchAnimation, {
      toValue: newMode ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  // 渲染頂部個人檔案（原標題位置）
  const renderTopProfile = () => {
    const displaySubtitle = isCoachMode ? '管理您的教練檔案和課程' : '查看和編輯您的個人檔案';
    
    return (
      <View style={styles.topProfileContainer}>
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.switchContainer} onPress={handleModeToggle}>
            <View style={styles.switchTrack}>
              <Animated.View style={[
                styles.switchThumb, 
                {
                  transform: [{
                    translateX: switchAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 26],
                    })
                  }]
                },
                isCoachMode ? styles.switchThumbRight : styles.switchThumbLeft
              ]}>
                <MaterialCommunityIcons 
                  name={isCoachMode ? 'teach' : 'school'} 
                  size={14} 
                  color="#ffffff" 
                />
              </Animated.View>
            </View>
            <View style={styles.switchLabels}>
              <Text style={[
                styles.switchLabel, 
                !isCoachMode && styles.activeSwitchLabel
              ]}>學生</Text>
              <Text style={[
                styles.switchLabel, 
                isCoachMode && styles.activeSwitchLabel
              ]}>教練</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
            <MaterialCommunityIcons 
              name="chat" 
              size={20} 
              color="#ffffff" 
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.topProfileButton} onPress={handleUserProfilePress}>
          <View style={styles.topProfileLeft}>
            <View style={styles.topUserAvatarContainer}>
              {userData.avatar && userData.avatar.startsWith('file://') ? (
                <Image 
                  source={{ uri: userData.avatar }} 
                  style={styles.topUserAvatarImage}
                />
              ) : (
                <MaterialCommunityIcons 
                  name={userData.avatar || "account-circle"} 
                  size={40} 
                  color="#00CED1" 
                />
              )}
            </View>
            <View style={styles.topProfileContent}>
              <Text style={styles.topUserName}>{userData.name}</Text>
              <Text style={styles.topUserId}>ID: Nah</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // 渲染廣告區域（原個人檔案位置）
  const renderAdvertisementSection = () => {
    return (
      <View style={styles.advertisementContainer}>
        <View style={styles.adCard}>
          <View style={styles.adHeader}>
            <MaterialCommunityIcons 
              name="bullhorn" 
              size={24} 
              color="#FF6B6B" 
            />
            <Text style={styles.adTitle}>健身推廣</Text>
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>AD</Text>
            </View>
          </View>
          
          <View style={styles.adContent}>
            <View style={styles.adImagePlaceholder}>
              <MaterialCommunityIcons 
                name="dumbbell" 
                size={32} 
                color="#00CED1" 
              />
            </View>
            <View style={styles.adTextContent}>
              <Text style={styles.adMainText}>新會員優惠！</Text>
              <Text style={styles.adSubText}>加入我們的健身計劃，享受專業指導</Text>
              <Text style={styles.adPrice}>首月只需 ¥99</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.adButton}>
            <Text style={styles.adButtonText}>立即了解</Text>
            <MaterialCommunityIcons 
              name="arrow-right" 
              size={16} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 渲染功能欄（原教練類別網格）
  const renderFunctionBar = () => {
    const currentFunctions = isCoachMode ? coachFunctions : functions;
    
    return (
      <View style={styles.functionSection}>
        <Text style={styles.sectionTitle}>
          {isCoachMode ? '教練功能' : '功能選單'}
        </Text>
        <View style={styles.functionBar}>
          {currentFunctions.map((func) => (
            <TouchableOpacity
              key={func.id}
              style={[
                styles.functionCard,
                selectedFunction === func.id && styles.selectedFunctionCard,
              ]}
              onPress={() => handleFunctionSelect(func)}
              activeOpacity={0.7}
            >
              <View style={[styles.functionIcon, { backgroundColor: func.color + '20' }]}>
                <MaterialCommunityIcons
                  name={func.icon}
                  size={24}
                  color={selectedFunction === func.id ? '#00CED1' : func.color}
                />
              </View>
              <Text style={styles.functionName}>{func.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // 渲染星級評分
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialCommunityIcons key={i} name="star" size={12} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialCommunityIcons key="half" name="star-half-full" size={12} color="#FFD700" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`empty-${i}`}
          name="star-outline"
          size={12}
          color="#A9A9A9"
        />
      );
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  // 渲染學生列表（教練模式）
  const renderStudentsList = () => (
    <View style={styles.coachesSection}>
      <Text style={styles.sectionTitle}>我的學生</Text>
      {mockStudents && mockStudents.length > 0 ? (
        mockStudents.map((student) => (
          <View key={student.id} style={styles.studentCard}>
            <View style={styles.coachHeader}>
              <View style={styles.avatarContainer}>
                <MaterialCommunityIcons name="account-circle" size={50} color="#4CAF50" />
              </View>
              <View style={styles.coachInfo}>
                <Text style={styles.coachName}>{student.name}</Text>
                <Text style={styles.studentLevel}>等級: {student.level}</Text>
                <Text style={styles.studentGoal}>目標: {student.goal}</Text>
                <Text style={styles.lastSession}>上次課程: {student.lastSession}</Text>
              </View>
            </View>
            
            <View style={styles.studentProgress}>
              <Text style={styles.progressLabel}>進度: {student.progress}%</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${student.progress}%` }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.studentStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{student.totalSessions}</Text>
                <Text style={styles.statLabel}>總課程</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{student.joinDate}</Text>
                <Text style={styles.statLabel}>加入日期</Text>
              </View>
            </View>

            <View style={styles.coachActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.detailsButton]}
                onPress={() => console.log('View student details:', student.name)}
              >
                <Text style={styles.detailsButtonText}>查看詳情</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.bookButton]}
                onPress={() => console.log('Schedule with:', student.name)}
              >
                <Text style={styles.bookButtonText}>安排課程</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group" size={60} color="#A9A9A9" />
          <Text style={styles.emptyStateText}>尚無學生</Text>
          <Text style={styles.emptyStateSubtext}>開始招募學生並建立課程</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTopProfile()}
        {renderAdvertisementSection()}
        {renderFunctionBar()}
        {isCoachMode ? renderStudentsList() : null}
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
    paddingHorizontal: 16,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  
  // 頂部個人檔案樣式
  topProfileContainer: {
    marginTop: 16,
    marginBottom: 30,
    position: 'relative',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    zIndex: 1,
    paddingTop: 16,
  },
  topProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 16,
    paddingRight: 100,
    gap: 8,
  },
  topProfileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  topUserAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  topUserAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  topProfileContent: {
    flex: 1,
  },
  topUserName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  topUserId: {
    color: '#00CED1',
    fontSize: 14,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  switchTrack: {
    width: 50,
    height: 24,
    backgroundColor: '#4A5657',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 2,
    left: 2,
  },
  switchThumbLeft: {
    backgroundColor: '#00CED1',
  },
  switchThumbRight: {
    backgroundColor: '#FF6B6B',
  },
  switchLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 50,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  switchLabel: {
    color: '#A9A9A9',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  activeSwitchLabel: {
    color: '#00CED1',
  },
  chatButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginTop: -2,
  },

  // 功能欄樣式（原類別網格）
  functionSection: {
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  functionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  functionCard: {
    flex: 1,
    backgroundColor: '#2E3A3B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5657',
    minWidth: 0,
  },
  selectedFunctionCard: {
    borderColor: '#00CED1',
    backgroundColor: '#2E3A3B',
  },
  functionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  functionName: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },

  // 教練列表樣式
  coachesSection: {
    flex: 1,
    marginBottom: 30,
  },
  coachCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  coachHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  coachCategory: {
    fontSize: 14,
    color: '#00CED1',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#A9A9A9',
  },
  lastSession: {
    fontSize: 12,
    color: '#A9A9A9',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: '#4A5657',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: '#ffffff',
  },
  coachActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  detailsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  detailsButtonText: {
    color: '#A9A9A9',
    fontSize: 14,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#00CED1',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // 空狀態樣式
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#A9A9A9',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },

  // 廣告區域樣式
  advertisementContainer: {
    marginBottom: 30,
  },
  adCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A5657',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
    flex: 1,
  },
  adBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  adImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 209, 0.3)',
  },
  adTextContent: {
    flex: 1,
  },
  adMainText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  adSubText: {
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 8,
    lineHeight: 20,
  },
  adPrice: {
    fontSize: 16,
    color: '#00CED1',
    fontWeight: '700',
  },
  adButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00CED1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  adButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // 學生列表樣式
  studentCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  studentLevel: {
    fontSize: 14,
    color: '#00CED1',
    marginBottom: 4,
  },
  studentGoal: {
    fontSize: 14,
    color: '#00CED1',
    marginBottom: 4,
  },
  studentProgress: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#4A5657',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00CED1',
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    color: '#A9A9A9',
  },
}); 