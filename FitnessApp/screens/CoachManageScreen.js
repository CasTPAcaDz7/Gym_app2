import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CoachManageScreen = ({ navigation }) => {
  const coaches = [
    {
      id: 1,
      name: '張教練',
      specialty: '重量訓練',
      rating: 4.8,
      experience: '5年經驗',
      nextSession: '明天 14:00',
      status: 'active',
      totalSessions: 24,
      avatar: '💪',
    },
    {
      id: 2,
      name: '李教練',
      specialty: '瑜伽 & 伸展',
      rating: 4.9,
      experience: '3年經驗',
      nextSession: '週三 16:30',
      status: 'active',
      totalSessions: 18,
      avatar: '🧘‍♀️',
    },
    {
      id: 3,
      name: '王教練',
      specialty: '有氧運動',
      rating: 4.7,
      experience: '4年經驗',
      nextSession: '週五 10:00',
      status: 'pending',
      totalSessions: 12,
      avatar: '🏃‍♂️',
    },
  ];

  const renderCoach = (coach) => (
    <TouchableOpacity
      key={coach.id}
      style={styles.coachCard}
      onPress={() => {
        console.log('查看教練詳情:', coach.name);
      }}
    >
      <View style={styles.coachAvatar}>
        <Text style={styles.avatarText}>{coach.avatar}</Text>
      </View>
      
      <View style={styles.coachInfo}>
        <View style={styles.coachHeader}>
          <Text style={styles.coachName}>{coach.name}</Text>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{coach.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.specialty}>{coach.specialty}</Text>
        <Text style={styles.experience}>{coach.experience}</Text>
        
        <View style={styles.sessionInfo}>
          <MaterialCommunityIcons name="calendar-clock" size={16} color="#00CED1" />
          <Text style={styles.nextSession}>下次課程: {coach.nextSession}</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{coach.totalSessions}</Text>
            <Text style={styles.statLabel}>總課程</Text>
          </View>
          
          <View style={[styles.statusBadge, 
            coach.status === 'active' ? styles.activeStatus : styles.pendingStatus]}>
            <Text style={styles.statusText}>
              {coach.status === 'active' ? '進行中' : '待確認'}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.moreButton}>
        <MaterialCommunityIcons name="dots-vertical" size={20} color="#A9A9A9" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>管理我的教練</Text>
        <TouchableOpacity style={styles.searchButton}>
          <MaterialCommunityIcons name="magnify" size={24} color="#00CED1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 統計卡片 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="account-supervisor" size={32} color="#00CED1" />
            <Text style={styles.statCardNumber}>3</Text>
            <Text style={styles.statCardLabel}>我的教練</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calendar-check" size={32} color="#4CAF50" />
            <Text style={styles.statCardNumber}>54</Text>
            <Text style={styles.statCardLabel}>完成課程</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="clock-outline" size={32} color="#FF9800" />
            <Text style={styles.statCardNumber}>3</Text>
            <Text style={styles.statCardLabel}>即將開始</Text>
          </View>
        </View>

        {/* 快速操作 */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="account-plus" size={24} color="#00CED1" />
            <Text style={styles.actionText}>尋找新教練</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="calendar-plus" size={24} color="#00CED1" />
            <Text style={styles.actionText}>預約課程</Text>
          </TouchableOpacity>
        </View>

        {/* 教練列表 */}
        <View style={styles.coachList}>
          <Text style={styles.sectionTitle}>我的教練團隊</Text>
          {coaches.map(renderCoach)}
        </View>

        {/* 開發中提示 */}
        <View style={styles.developmentNote}>
          <MaterialCommunityIcons name="information" size={20} color="#00CED1" />
          <Text style={styles.noteText}>
            教練管理功能正在開發中，包含課程預約、進度追蹤等功能！
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2E3A3B',
    borderBottomWidth: 1,
    borderBottomColor: '#4A5657',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '30%',
  },
  statCardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#A9A9A9',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '45%',
    borderWidth: 1,
    borderColor: '#00CED1',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  coachList: {
    marginBottom: 30,
  },
  coachCard: {
    flexDirection: 'row',
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachAvatar: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
  },
  coachInfo: {
    flex: 1,
  },
  coachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: '600',
  },
  specialty: {
    fontSize: 14,
    color: '#00CED1',
    marginBottom: 2,
  },
  experience: {
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 8,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nextSession: {
    fontSize: 12,
    color: '#00CED1',
    marginLeft: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: '#A9A9A9',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  pendingStatus: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moreButton: {
    padding: 5,
  },
  developmentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  noteText: {
    color: '#00CED1',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
});

export default CoachManageScreen; 