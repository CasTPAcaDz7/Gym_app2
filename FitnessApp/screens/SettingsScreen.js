import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }) {
  const [studentData, setStudentData] = useState({
    name: '王小明',
    avatar: 'account-circle',
    role: '健身愛好者',
  });
  
  const [coachData, setCoachData] = useState(null); // null表示未開通教練帳號
  const [isCoachEnabled, setIsCoachEnabled] = useState(false);

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
      // 載入學生資料
      const studentProfileData = await AsyncStorage.getItem('studentProfile');
      if (studentProfileData) {
        const parsedStudentData = JSON.parse(studentProfileData);
        setStudentData(prevData => ({
          ...prevData,
          ...parsedStudentData,
        }));
      }
      
      // 載入教練資料
      const coachProfileData = await AsyncStorage.getItem('coachProfile');
      if (coachProfileData) {
        const parsedCoachData = JSON.parse(coachProfileData);
        setCoachData(parsedCoachData);
        setIsCoachEnabled(true);
      } else {
        setCoachData(null);
        setIsCoachEnabled(false);
      }
      
      // 如果沒有分離的資料，從舊的userProfile載入學生資料
      if (!studentProfileData) {
        const legacyUserProfileData = await AsyncStorage.getItem('userProfile');
        if (legacyUserProfileData) {
          const parsedLegacyData = JSON.parse(legacyUserProfileData);
          setStudentData(prevData => ({
            ...prevData,
            ...parsedLegacyData,
          }));
        }
      }
      
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    }
  };

  // 進入學生設定頁面
  const handleStudentSettingsPress = () => {
    navigation.navigate('Profile', { mode: 'student' });
  };

  // 進入教練設定頁面或開通教練帳號
  const handleCoachSettingsPress = () => {
    if (isCoachEnabled && coachData) {
      navigation.navigate('Profile', { mode: 'coach' });
    } else {
      // 開通教練帳號
      enableCoachAccount();
    }
  };

  // 開通教練帳號
  const enableCoachAccount = async () => {
    try {
      const defaultCoachData = {
        name: '李教練',
        avatar: 'teach',
        role: '專業健身教練',
        level: '資深',
        joinDate: new Date().toISOString().split('T')[0],
        specialties: ['重量訓練', '有氧運動', '營養指導'],
        certification: 'ACSM認證',
        experience: '新手教練',
        height: 175,
        weight: 75,
        age: 30,
        goal: '專業指導',
      };
      
      await AsyncStorage.setItem('coachProfile', JSON.stringify(defaultCoachData));
      setCoachData(defaultCoachData);
      setIsCoachEnabled(true);
    } catch (error) {
      console.error('開通教練帳號失敗:', error);
    }
  };

  // 渲染用戶資訊卡片
  const renderUserInfoCard = () => (
    <TouchableOpacity style={styles.userInfoCard} onPress={handleStudentSettingsPress}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="account" size={24} color="#00CED1" />
        <Text style={styles.cardTitle}>用戶資訊</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#A9A9A9" />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          {studentData.avatar && studentData.avatar.startsWith('file://') ? (
            <Image 
              source={{ uri: studentData.avatar }} 
              style={styles.avatarImage}
            />
          ) : (
            <MaterialCommunityIcons 
              name={studentData.avatar || "account-circle"} 
              size={40} 
              color="#00CED1" 
            />
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{studentData.name}</Text>
          <Text style={styles.userId}>ID: Student</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 渲染教練資訊卡片
  const renderCoachInfoCard = () => (
    <TouchableOpacity style={styles.coachInfoCard} onPress={handleCoachSettingsPress}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="teach" size={24} color="#FF6B6B" />
        <Text style={styles.cardTitle}>教練資訊</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#A9A9A9" />
      </View>
      <View style={styles.cardContent}>
        {isCoachEnabled && coachData ? (
          <>
            <View style={styles.avatarContainer}>
              {coachData.avatar && coachData.avatar.startsWith('file://') ? (
                <Image 
                  source={{ uri: coachData.avatar }} 
                  style={styles.avatarImage}
                />
              ) : (
                <MaterialCommunityIcons 
                  name={coachData.avatar || "teach"} 
                  size={40} 
                  color="#FF6B6B" 
                />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{coachData.name}</Text>
              <Text style={styles.userId}>ID: Coach</Text>
            </View>
          </>
        ) : (
          <View style={styles.disabledContent}>
            <MaterialCommunityIcons name="account-off" size={40} color="#666666" />
            <View style={styles.userInfo}>
              <Text style={styles.disabledTitle}>未開通教練帳號</Text>
              <Text style={styles.disabledSubtitle}>點擊開通教練功能</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // 渲染設定選項
  const renderSettingsOptions = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>其他設定</Text>
      
      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <MaterialCommunityIcons name="bell" size={24} color="#00CED1" />
          <Text style={styles.settingText}>通知設定</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#A9A9A9" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#4CAF50" />
          <Text style={styles.settingText}>隱私設定</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#A9A9A9" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <MaterialCommunityIcons name="help-circle" size={24} color="#FF9800" />
          <Text style={styles.settingText}>幫助與支援</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#A9A9A9" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <MaterialCommunityIcons name="information" size={24} color="#9C27B0" />
          <Text style={styles.settingText}>關於應用</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#A9A9A9" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      
      {/* 標題欄 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 用戶資訊區域 */}
        <View style={styles.userSection}>
          {renderUserInfoCard()}
          {renderCoachInfoCard()}
        </View>

        {/* 設定選項 */}
        {renderSettingsOptions()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3A3B',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },

  // 用戶資訊區域
  userSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  userInfoCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  coachInfoCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginLeft: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#00CED1',
  },
  disabledContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  disabledTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A9A9A9',
    marginBottom: 4,
  },
  disabledSubtitle: {
    fontSize: 14,
    color: '#666666',
  },

  // 設定選項區域
  settingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    marginLeft: 4,
  },
  settingItem: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
}); 