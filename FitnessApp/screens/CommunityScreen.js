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
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CommunityScreen({ navigation, route }) {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [isCoachMode, setIsCoachMode] = useState(false); // 新增：模式切換狀態，false為學生模式，true為教練模式
  
  // 動畫值用於開關掣
  const switchAnimation = useRef(new Animated.Value(0)).current;
  
  // 用戶資料 - 分離學生和教練資料
  const [studentData, setStudentData] = useState({
    name: '王小明',
    avatar: 'account-circle',
    role: '健身愛好者',
    level: '中級',
    joinDate: '2024-01-15',
  });
  
  const [coachData, setCoachData] = useState({
    name: '李教練',
    avatar: 'teach',
    role: '專業健身教練',
    level: '資深',
    joinDate: '2023-06-01',
    specialties: ['重量訓練', '有氧運動', '營養指導'],
    certification: 'ACSM認證',
    experience: '5年',
  });
  
  // 根據當前模式獲取對應的用戶數據
  const getCurrentUserData = () => {
    return isCoachMode ? coachData : studentData;
  };

  // 功能欄數據（原教練類別改為功能欄）
  const functions = [
    { id: 1, name: '尋找教練', icon: 'account-search', color: '#00CED1' },
    { id: 2, name: '管理教練', icon: 'account-tie', color: '#FF6B6B' },
    { id: 4, name: '共用', icon: 'share-variant', color: '#FF9800' },
    { id: 5, name: '快速預約', icon: 'calendar-plus', color: '#E91E63' },
    { id: 6, name: '過往預約記錄', icon: 'history', color: '#9C27B0' },
  ];

  // 教練模式功能欄
  const coachFunctions = [
    { id: 1, name: '課表規劃', icon: 'calendar-clock', color: '#00CED1' },
    { id: 2, name: '教材管理', icon: 'book-open-variant', color: '#FF6B6B' },
    { id: 3, name: '管理學生', icon: 'account-group', color: '#4CAF50' },
    { id: 4, name: '收入統計', icon: 'chart-line', color: '#9C27B0' },
    { id: 5, name: '學生共享媒體', icon: 'folder-multiple-image', color: '#FF9800' },
    { id: 6, name: '預約上堂', icon: 'calendar-plus', color: '#E91E63' },
  ];

  // 教練統計數據
  const [coachStats, setCoachStats] = useState({
    studentsCount: 0,
    recentViews: 156,
    postsCount: 23,
  });

  // 當天預約數據
  const [todayBookings, setTodayBookings] = useState([
    {
      id: 1,
      coachName: '李教練',
      time: '14:00 - 15:00',
      type: '重量訓練',
      status: '已確認',
      location: '健身房A區',
    },
    {
      id: 2,
      coachName: '王教練',
      time: '19:00 - 20:00',
      type: '有氧訓練',
      status: '待確認',
      location: '健身房B區',
    },
    {
      id: 3,
      coachName: '張教練',
      time: '21:00 - 22:00',
      type: '瑜伽課程',
      status: '已確認',
      location: '瑜伽室',
    }
  ]);

  // 獲取螢幕寬度
  const screenWidth = Dimensions.get('window').width;
  // 預約卡片當前索引
  const [currentBookingIndex, setCurrentBookingIndex] = useState(0);
  
  // 更新統計數據
  const updateCoachStats = () => {
    setCoachStats({
      studentsCount: mockStudents.length,
      recentViews: 156, // 模擬數據，後續會從API獲取
      postsCount: 23,   // 模擬數據，後續會從API獲取
    });
  };

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
    updateCoachStats();
    
    // 檢查是否需要保持特定模式
    if (route?.params?.preserveMode) {
      const shouldBeCoachMode = route.params.preserveMode === 'coach';
      if (shouldBeCoachMode !== isCoachMode) {
        setIsCoachMode(shouldBeCoachMode);
        // 更新開關動畫位置
        Animated.spring(switchAnimation, {
          toValue: shouldBeCoachMode ? 1 : 0,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      }
      // 清除參數，避免重複處理
      navigation.setParams({ preserveMode: undefined });
    }
    
    // 添加focus監聽器，當頁面獲得焦點時重新載入用戶資料
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
      updateCoachStats();
    });

    return unsubscribe;
  }, [navigation, route?.params]);

  

  const loadUserData = async () => {
    try {
      // 載入學生資料
      const studentProfileData = await AsyncStorage.getItem('studentProfile');
      if (studentProfileData) {
        const parsedStudentData = JSON.parse(studentProfileData);
        setStudentData(prevData => ({
          ...prevData,
          name: parsedStudentData.name || prevData.name,
          ...parsedStudentData,
        }));
      }
      
      // 載入教練資料
      const coachProfileData = await AsyncStorage.getItem('coachProfile');
      if (coachProfileData) {
        const parsedCoachData = JSON.parse(coachProfileData);
        setCoachData(prevData => ({
          ...prevData,
          name: parsedCoachData.name || prevData.name,
          ...parsedCoachData,
        }));
      }
      
      // 如果沒有分離的資料，從舊的userProfile移轉
      const legacyUserProfileData = await AsyncStorage.getItem('userProfile');
      if (legacyUserProfileData && !studentProfileData && !coachProfileData) {
        const parsedLegacyData = JSON.parse(legacyUserProfileData);
        // 將舊資料設定給學生，教練使用預設資料
        setStudentData(prevData => ({
          ...prevData,
          name: parsedLegacyData.name || prevData.name,
          avatar: parsedLegacyData.avatar || prevData.avatar,
        }));
                 // 教練保持獨立的預設資料，不使用舊的學生資料
        setCoachData(prevData => ({
          ...prevData,
          name: '李教練',
          avatar: 'teach',
        }));
      }
      
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    }
  };

  // 處理功能選擇
  const handleFunctionSelect = (func) => {
    setSelectedFunction(func.id);
    
    if (isCoachMode) {
      // 教練模式功能
      if (func.name === '課表規劃') {
        console.log('Navigate to Schedule Planning');
      } else if (func.name === '教材管理') {
        console.log('Navigate to Material Management');
      } else if (func.name === '管理學生') {
        console.log('Navigate to Student Management');
      } else if (func.name === '收入統計') {
        console.log('Navigate to Income Statistics');
      } else if (func.name === '學生共享媒體') {
        console.log('Navigate to Student Shared Media');
      } else if (func.name === '預約上堂') {
        console.log('Navigate to Class Booking');
      }
    } else {
      // 學生模式功能
      if (func.name === '尋找教練') {
        navigation.navigate('FindCoach');
      } else if (func.name === '管理教練') {
        console.log('Navigate to Coach Management');
      } else if (func.name === '共用') {
        console.log('Navigate to Share');
      } else if (func.name === '快速預約') {
        console.log('Navigate to Quick Booking');
      } else if (func.name === '過往預約記錄') {
        console.log('Navigate to Booking History');
      }
    }
  };

  // 處理聊天室按鈕點擊
  const handleChatPress = () => {
    // 跳轉到聊天室頁面
    console.log('Navigate to Chat Room');
  };

  // 處理通知按鈕點擊
  const handleNotificationPress = () => {
    // 跳轉到通知頁面
    console.log('Navigate to Notifications');
  };

  // 個人資訊按鈕處理函數
  const handleUserProfilePress = () => {
    // 傳遞當前模式到ProfileScreen
    navigation.navigate('Profile', { mode: isCoachMode ? 'coach' : 'student' });
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
          
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
            <MaterialCommunityIcons 
              name="bell" 
              size={20} 
              color="#ffffff" 
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.topProfileButton} onPress={handleUserProfilePress}>
          <View style={styles.topProfileLeft}>
            <View style={styles.topProfileContent}>
              <Text style={styles.topUserName}>{getCurrentUserData().name}</Text>
              <Text style={styles.topUserId}>ID: {isCoachMode ? 'Coach' : 'Student'}</Text>
            </View>
          </View>
          
          {/* Instagram風格統計信息 - 僅教練模式顯示 */}
          {isCoachMode && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{coachStats.studentsCount}</Text>
                <Text style={styles.statLabel}>學生</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{coachStats.recentViews}</Text>
                <Text style={styles.statLabel}>瀏覽</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{coachStats.postsCount}</Text>
                <Text style={styles.statLabel}>帖子</Text>
              </View>
            </View>
          )}
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
        {isCoachMode ? (
          // 教練模式：3x3格式（第三行只有1個居中按鈕）
          <View style={styles.coachFunctionContainer}>
            <View style={styles.coachFunctionGrid}>
              {currentFunctions.slice(0, 6).map((func) => (
                <TouchableOpacity
                  key={func.id}
                  style={[
                    styles.coachFunctionCard,
                    selectedFunction === func.id && styles.selectedFunctionCard,
                  ]}
                  onPress={() => handleFunctionSelect(func)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.functionIcon, { backgroundColor: func.color + '20' }]}>
                    <MaterialCommunityIcons
                      name={func.icon}
                      size={20}
                      color={selectedFunction === func.id ? '#00CED1' : func.color}
                    />
                  </View>
                  <Text style={styles.functionName}>{func.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {currentFunctions.length > 6 && (
              <View style={styles.coachFunctionSingleRow}>
                <TouchableOpacity
                  key={currentFunctions[6].id}
                  style={[
                    styles.coachFunctionSingleCard,
                    selectedFunction === currentFunctions[6].id && styles.selectedFunctionCard,
                  ]}
                  onPress={() => handleFunctionSelect(currentFunctions[6])}
                  activeOpacity={0.7}
                >
                  <View style={[styles.functionIcon, { backgroundColor: currentFunctions[6].color + '20' }]}>
                    <MaterialCommunityIcons
                      name={currentFunctions[6].icon}
                      size={20}
                      color={selectedFunction === currentFunctions[6].id ? '#00CED1' : currentFunctions[6].color}
                    />
                  </View>
                  <Text style={styles.functionName}>{currentFunctions[6].name}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          // 學生模式：2x3格式（6個按鈕）
          <View style={styles.studentFunctionContainer}>
            <View style={styles.studentFunctionGrid}>
              {currentFunctions.map((func) => (
                <TouchableOpacity
                  key={func.id}
                  style={[
                    styles.studentFunctionGridCard,
                    selectedFunction === func.id && styles.selectedFunctionCard,
                  ]}
                  onPress={() => handleFunctionSelect(func)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.functionIcon, { backgroundColor: func.color + '20' }]}>
                    <MaterialCommunityIcons
                      name={func.icon}
                      size={20}
                      color={selectedFunction === func.id ? '#00CED1' : func.color}
                    />
                  </View>
                  <Text style={styles.functionName}>{func.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  // 處理預約卡片滑動
  const handleBookingScroll = (event) => {
    const slideSize = screenWidth - 32; // 減去左右邊距
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    
    const currentIndex = Math.min(Math.max(roundIndex, 0), todayBookings.length - 1);
    setCurrentBookingIndex(currentIndex);
  };

  // 渲染當天預約框（僅學生模式）
  const renderTodayBookings = () => {
    if (isCoachMode || !todayBookings || todayBookings.length === 0) {
      return null; // 教練模式或無預約時不顯示
    }

    return (
      <View style={styles.todayBookingsSection}>
        <View style={styles.bookingSectionHeader}>
          <Text style={styles.sectionTitle}>今日預約</Text>
          {todayBookings.length > 1 && (
            <Text style={styles.sectionPageIndicator}>
              {currentBookingIndex + 1} / {todayBookings.length}
            </Text>
          )}
        </View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleBookingScroll}
          style={styles.bookingScrollView}
          contentContainerStyle={styles.bookingScrollContent}
        >
          {todayBookings.map((booking, index) => (
            <View key={booking.id} style={[styles.bookingCard, { width: screenWidth - 32 }]}>
              <View style={styles.bookingHeader}>
                <View style={styles.bookingTime}>
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={16} 
                    color="#00CED1" 
                  />
                  <Text style={styles.bookingTimeText}>{booking.time}</Text>
                </View>
                <View style={[
                  styles.bookingStatus,
                  booking.status === '已確認' ? styles.bookingStatusConfirmed : styles.bookingStatusPending
                ]}>
                  <Text style={[
                    styles.bookingStatusText,
                    booking.status === '已確認' ? styles.bookingStatusConfirmedText : styles.bookingStatusPendingText
                  ]}>{booking.status}</Text>
                </View>
              </View>
              
              <View style={styles.bookingInfo}>
                <View style={styles.bookingDetail}>
                  <MaterialCommunityIcons 
                    name="account-tie" 
                    size={16} 
                    color="#A9A9A9" 
                  />
                  <Text style={styles.bookingDetailText}>{booking.coachName}</Text>
                </View>
                <View style={styles.bookingDetail}>
                  <MaterialCommunityIcons 
                    name="dumbbell" 
                    size={16} 
                    color="#A9A9A9" 
                  />
                  <Text style={styles.bookingDetailText}>{booking.type}</Text>
                </View>
                <View style={styles.bookingDetail}>
                  <MaterialCommunityIcons 
                    name="map-marker-outline" 
                    size={16} 
                    color="#A9A9A9" 
                  />
                  <Text style={styles.bookingDetailText}>{booking.location}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        
        {/* 預約指示器點 */}
        {todayBookings.length > 1 && (
          <View style={styles.bookingIndicator}>
            {todayBookings.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  index === currentBookingIndex && styles.indicatorDotActive
                ]}
              />
            ))}
          </View>
        )}
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
        {!isCoachMode && renderAdvertisementSection()}
        {!isCoachMode && renderTodayBookings()}
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 16,
    paddingRight: 100,
    gap: 12,
  },
  topProfileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
  // Instagram風格統計信息樣式
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginLeft: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    color: '#A9A9A9',
    fontSize: 12,
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
  notificationButton: {
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
  // 教練模式3x3格式
  coachFunctionContainer: {
    gap: 8,
  },
  coachFunctionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  coachFunctionCard: {
    width: '31%',
    backgroundColor: '#2E3A3B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  coachFunctionSingleRow: {
    alignItems: 'center',
  },
  coachFunctionSingleCard: {
    width: '31%',
    backgroundColor: '#2E3A3B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  // 學生模式2x3格式
  studentFunctionContainer: {
    gap: 8,
  },
  studentFunctionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  studentFunctionGridCard: {
    width: '31%',
    backgroundColor: '#2E3A3B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  selectedFunctionCard: {
    borderColor: '#00CED1',
    backgroundColor: '#2E3A3B',
  },
  functionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  functionName: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
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

  // 當天預約樣式
  todayBookingsSection: {
    marginBottom: 30,
  },
  bookingSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  sectionPageIndicator: {
    fontSize: 14,
    color: '#00CED1',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bookingScrollView: {
    marginBottom: 12,
    marginTop: 0,
  },
  bookingScrollContent: {
    paddingHorizontal: 0,
  },
  bookingCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    marginRight: 0,
    borderWidth: 1,
    borderColor: '#4A5657',
    position: 'relative',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingTimeText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  bookingStatus: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bookingStatusConfirmed: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  bookingStatusPending: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingStatusConfirmedText: {
    color: '#4CAF50',
  },
  bookingStatusPendingText: {
    color: '#FFC107',
  },
  bookingInfo: {
    gap: 8,
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingDetailText: {
    fontSize: 14,
    color: '#A9A9A9',
  },
  bookingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A5657',
  },
  indicatorDotActive: {
    backgroundColor: '#00CED1',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

}); 