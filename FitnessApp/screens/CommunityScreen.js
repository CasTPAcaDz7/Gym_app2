import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CommunityScreen({ navigation }) {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [isCoachMode, setIsCoachMode] = useState(false); // 新增：模式切換狀態，false為學生模式，true為教練模式
  
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
    { id: 2, name: '健身論壇', icon: 'forum', color: '#FF6B6B' },
  ];

  // 教練模式功能欄
  const coachFunctions = [
    { id: 1, name: '我的學生', icon: 'account-group', color: '#00CED1' },
    { id: 2, name: '課程管理', icon: 'calendar-clock', color: '#FF6B6B' },
    { id: 3, name: '收入統計', icon: 'chart-line', color: '#4CAF50' },
  ];

  // 模擬已匹配教練數據
  const mockCoaches = [
    {
      id: 1,
      name: '張健身',
      category: '私人教練',
      rating: 4.8,
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      specialties: ['重量訓練', '減脂'],
      lastSession: '2025-06-15',
      hourlyRate: 500,
      experience: 5,
      isMatched: true,
    },
    {
      id: 2,
      name: '李瑜伽',
      category: '瑜伽導師',
      rating: 4.9,
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      specialties: ['哈達瑜伽', '冥想'],
      lastSession: '2025-06-10',
      hourlyRate: 400,
      experience: 8,
      isMatched: true,
    },
    {
      id: 3,
      name: '王營養師',
      category: '營養師',
      rating: 4.7,
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      specialties: ['運動營養', '體重管理'],
      lastSession: '2025-06-12',
      hourlyRate: 600,
      experience: 6,
      isMatched: true,
    },
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

  const [matchedCoaches] = useState(mockCoaches); // 現在mockCoaches已經定義了

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
    } else if (func.name === '健身論壇') {
      handleForumPress();
    }
  };

  // 處理論壇按鈕點擊
  const handleForumPress = () => {
    // 跳轉到論壇頁面
    console.log('Navigate to Forum');
  };

  // 個人資訊按鈕處理函數
  const handleUserProfilePress = () => {
    navigation.navigate('Profile');
  };

  // 模式切換處理函數
  const handleModeToggle = () => {
    setIsCoachMode(!isCoachMode);
    setSelectedFunction(null); // 切換模式時重置選中的功能
  };

  // 處理教練詳情
  const handleCoachDetails = (coach) => {
    console.log('View coach details:', coach.name);
  };

  // 處理預約課程
  const handleBookSession = (coach) => {
    console.log('Book session with:', coach.name);
  };

  // 渲染頂部標題（添加模式切換按鈕）
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>社群</Text>
      <TouchableOpacity style={styles.modeToggleButton} onPress={handleModeToggle}>
        <MaterialCommunityIcons 
          name={isCoachMode ? 'school' : 'teach'} 
          size={20} 
          color="#ffffff" 
        />
        <Text style={styles.modeToggleText}>
          {isCoachMode ? '學生' : '教練'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染個人資訊按鈕（取代搜尋框）
  const renderUserProfileSection = () => {
    const displaySubtitle = isCoachMode ? '管理您的教練檔案和課程' : '查看和編輯您的個人檔案';
    
    return (
      <View style={styles.profileSectionContainer}>
        <TouchableOpacity style={styles.profileButton} onPress={handleUserProfilePress}>
          <View style={styles.profileButtonLeft}>
            <View style={styles.userAvatarContainer}>
              {userData.avatar && userData.avatar.startsWith('file://') ? (
                <Image 
                  source={{ uri: userData.avatar }} 
                  style={styles.userAvatarImage}
                />
              ) : (
                <MaterialCommunityIcons 
                  name={userData.avatar || "account-circle"} 
                  size={50} 
                  color="#00CED1" 
                />
              )}
            </View>
            <View style={styles.profileButtonContent}>
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userId}>ID: Nah</Text>
              <Text style={styles.profileButtonSubtitle}>{displaySubtitle}</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={28} color="#A9A9A9" />
        </TouchableOpacity>
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
                  size={28}
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

  // 渲染已匹配教練列表
  const renderMatchedCoaches = () => (
    <View style={styles.coachesSection}>
      <Text style={styles.sectionTitle}>我的教練</Text>
      {matchedCoaches && matchedCoaches.length > 0 ? (
        matchedCoaches.map((coach) => (
          <View key={coach.id} style={styles.coachCard}>
            <View style={styles.coachHeader}>
              <View style={styles.avatarContainer}>
                <MaterialCommunityIcons name="account-circle" size={50} color="#00CED1" />
              </View>
              <View style={styles.coachInfo}>
                <Text style={styles.coachName}>{coach.name}</Text>
                <Text style={styles.coachCategory}>{coach.category}</Text>
                <View style={styles.ratingContainer}>
                  {renderStars(coach.rating)}
                  <Text style={styles.ratingText}>{coach.rating}</Text>
                </View>
                <Text style={styles.lastSession}>上次課程: {coach.lastSession}</Text>
              </View>
            </View>
            
            <View style={styles.specialtiesContainer}>
              {coach.specialties && coach.specialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>

            <View style={styles.coachActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.detailsButton]}
                onPress={() => handleCoachDetails(coach)}
              >
                <Text style={styles.detailsButtonText}>查看詳情</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.bookButton]}
                onPress={() => handleBookSession(coach)}
              >
                <Text style={styles.bookButtonText}>預約課程</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-search" size={60} color="#A9A9A9" />
          <Text style={styles.emptyStateText}>尚未匹配任何教練</Text>
          <Text style={styles.emptyStateSubtext}>點擊上方類別開始尋找合適的教練</Text>
        </View>
      )}
    </View>
  );

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
        {renderHeader()}
        {renderUserProfileSection()}
        {renderFunctionBar()}
        {isCoachMode ? renderStudentsList() : renderMatchedCoaches()}
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
  
  // 頂部用戶資訊按鈕樣式
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },

  // 個人資訊按鈕樣式
  profileSectionContainer: {
    marginBottom: 30,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E3A3B',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#00CED1',
    gap: 8,
    elevation: 2,
    shadowColor: '#00CED1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileButtonContent: {
    flex: 1,
  },
  userName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  userId: {
    color: '#00CED1',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  profileButtonSubtitle: {
    color: '#A9A9A9',
    fontSize: 12,
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
    justifyContent: 'space-around',
    gap: 16,
  },
  functionCard: {
    flex: 1,
    backgroundColor: '#2E3A3B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  selectedFunctionCard: {
    borderColor: '#00CED1',
    backgroundColor: '#2E3A3B',
  },
  functionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  functionName: {
    fontSize: 16,
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

  // 模式切換按鈕樣式
  modeToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E3A3B',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#00CED1',
  },
  modeToggleText: {
    color: '#ffffff',
    fontSize: 14,
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