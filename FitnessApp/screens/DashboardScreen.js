import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStats, useFoodRecords, useExerciseRecords, useWeightRecords } from '../hooks/useStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useActivities } from '../hooks/useStorage';

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState([]);
  const [todayWorkouts, setTodayWorkouts] = useState([]);
  const [dailyComment, setDailyComment] = useState('');
  
  // 使用自定義Hooks獲取數據
  const { todayOverview, weeklyStats, refreshStats } = useStats();
  const { todayFoods, getTodayTotalCalories } = useFoodRecords();
  const { todayExercises, getTodayTotalCaloriesBurned } = useExerciseRecords();
  const { latestWeight } = useWeightRecords();
  const { loadActivitiesByDate } = useActivities();

  // 添加活動數據狀態
  const [weekActivities, setWeekActivities] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 當頁面重新聚焦時刷新數據
  useFocusEffect(
    React.useCallback(() => {
      refreshStats();
      loadWeekActivities(); // 添加活動數據刷新
    }, [refreshStats])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 設置當前週的日期
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const week = [];
      const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        week.push({
          day: dayLabels[i],
          date: date.getDate(),
          isToday: date.toDateString() === today.toDateString(),
          fullDate: date,
        });
      }
      setCurrentWeek(week);

      // 模擬今日運動計劃（可以後續從真實數據獲取）
      setTodayWorkouts([
        { id: 1, training: 'Chest Press', weight: '150 kg', sets: 4, reps: 20, completed: false },
        { id: 2, training: 'Bench Press', weight: '150 kg', sets: 4, reps: 12, completed: false },
        { id: 3, training: 'Cable chest fly', weight: '150 kg', sets: 5, reps: 12, completed: false },
        { id: 4, training: 'Cable Crossover', weight: '150 kg', sets: 3, reps: 16, completed: false },
      ]);

      generateDailyComment();

      // 載入週活動數據
      await loadWeekActivities();

      await new Promise(resolve => setTimeout(resolve, 500)); // 減少載入時間

    } catch (error) {
      console.error('載入數據失敗:', error);
      Alert.alert('錯誤', '載入數據失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 載入週活動數據
  const loadWeekActivities = async () => {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const activitiesMap = {};
      
      // 為本週每一天載入活動
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateKey = date.toDateString();
        
        try {
          const activities = await loadActivitiesByDate(date);
          activitiesMap[dateKey] = activities || [];
        } catch (err) {
          console.error('Load week activities error:', err);
          activitiesMap[dateKey] = [];
        }
      }
      
      setWeekActivities(activitiesMap);
    } catch (error) {
      console.error('載入週活動數據失敗:', error);
    }
  };

  // 獲取指定日期的活動顏色列表（去重且最多5個）
  const getActivityColorsForDate = (date) => {
    const dateKey = date.toDateString();
    const activities = weekActivities[dateKey] || [];
    
    // 提取顏色並去重
    const colors = [...new Set(activities.map(activity => activity.color || '#00CED1'))];
    
    // 限制最多5個顏色
    return colors.slice(0, 5);
  };

  // 獲取飲食數據
  const getDietData = () => {
    const dailyGoal = 2600;
    const consumed = getTodayTotalCalories();
    const burned = getTodayTotalCaloriesBurned();
    const remaining = Math.max(0, dailyGoal - consumed); // 不包括運動消耗
    
    return {
      dailyGoal,
      consumed,
      burned,
      remaining
    };
  };

  const generateDailyComment = () => {
    const comments = [
      "Great job today!",
      "Keep pushing!",
      "Excellent workout!",
      "Stay consistent!",
      "You're getting stronger!",
    ];
    setDailyComment(comments[Math.floor(Math.random() * comments.length)]);
  };

  const markWorkoutComplete = async (workoutId) => {
    try {
      setTodayWorkouts(prev => 
        prev.map(workout => 
          workout.id === workoutId 
            ? { ...workout, completed: true }
            : workout
        )
      );
      
      console.log('Workout marked complete:', workoutId);
    } catch (error) {
      console.error('標記訓練失敗:', error);
      Alert.alert('錯誤', '標記訓練失敗');
    }
  };

  const renderWeeklyCalendar = () => (
    <View style={styles.weeklyCalendarCard}>
      <View style={styles.calendarHeader}>
        <View style={styles.weekContainer}>
          {currentWeek.map((day, index) => {
            const activityColors = getActivityColorsForDate(day.fullDate);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayContainer,
                  day.isToday && styles.todayContainer,
                ]}
                onPress={() => {
                  // 跳轉到Calendar tab並傳遞選中的日期
                  navigation.getParent()?.navigate('Calendar', {
                    screen: 'CalendarMain',
                    params: { selectedDate: day.fullDate.toISOString().split('T')[0] }
                  });
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayLabel,
                  day.isToday && styles.todayText,
                ]}>
                  {day.day}
                </Text>
                <Text style={[
                  styles.dateLabel,
                  day.isToday && styles.todayText,
                ]}>
                  {day.date}
                </Text>
                
                {/* 活動顏色指示點 */}
                {activityColors.length > 0 && (
                  <View style={styles.weekActivityDotsContainer}>
                    {activityColors.map((color, colorIndex) => (
                      <View 
                        key={colorIndex} 
                        style={[styles.weekActivityColorDot, { backgroundColor: color }]} 
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderTodayWorkouts = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Today Workouts</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'left' }]}>Training</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Weight</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>No. of Set</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>No. of Reps</Text>
        <View style={{ flex: 1 }}></View>
      </View>
      {todayWorkouts.map((workout) => (
        <View key={workout.id} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 2, textAlign: 'left' }]}>{workout.training}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{workout.weight}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{workout.sets}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{workout.reps}</Text>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <TouchableOpacity
              style={[
                styles.doneButton,
                workout.completed && styles.completedButton,
              ]}
              onPress={() => !workout.completed && markWorkoutComplete(workout.id)}
              disabled={workout.completed}
            >
              <Text style={styles.doneButtonText}>
                {workout.completed ? 'COMPLETED' : 'DONE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSimpleCharts = () => {
    return (
      <View style={styles.chartsContainer}>
        <TouchableOpacity 
          style={[styles.chartCard, styles.halfWidthChart]}
          onPress={() => navigation.navigate('CaloriesAnalytics')}
          activeOpacity={0.7}
        >
          <Text style={styles.chartTitle}>Progress</Text>
          <View style={styles.simpleChart}>
            <MaterialCommunityIcons name="chart-donut" size={60} color="#00CED1" />
            <Text style={styles.chartValue}>{getDietData().remaining} kcal</Text>
            <Text style={styles.chartSubtext}>剩餘卡路里</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CheckIn')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="camera-plus" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Check-in</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CaloriesAnalytics')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="nutrition" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Diet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('WeightIn')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="scale-bathroom" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Weight-in</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Exercise')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="dumbbell" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Exercise</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBottomActions = () => (
    <View style={styles.actionsContainer}>
      <View style={styles.commentCard}>
        <Text style={styles.commentText}>
          {dailyComment || "(comment GENERATED)"}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00CED1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      <View style={styles.content}>
        {renderWeeklyCalendar()}
        
        {renderBottomActions()}
        
        <View style={styles.middleContent}>
          {renderTodayWorkouts()}
          {renderSimpleCharts()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C2526',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  
  // Weekly Calendar Styles
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    height: '100%',
  },
  weekContainer: {
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'flex-start',
    paddingTop: 0,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 2,
    height: 85,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  todayContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 1,
    elevation: 3,
    shadowColor: '#00CED1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingTop: 6,
    paddingBottom: 12,
  },
  dayLabel: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 1,
  },
  dateLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  todayText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  weekActivityDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    minHeight: 12,
  },
  weekActivityColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  
  // Workout Table Styles
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#4A5657',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    color: '#A9A9A9',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#4A5657',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  doneButtonText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Simple Charts Styles
  chartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  chartCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
    width: screenWidth * 0.45,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  simpleChart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  chartValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00CED1',
    marginTop: 10,
  },
  chartSubtext: {
    fontSize: 12,
    color: '#A9A9A9',
    marginTop: 5,
  },
  
  // Bottom Actions Styles
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 8,
  },
  commentCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 12,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: '#A9A9A9',
    textAlign: 'center',
  },
  middleContent: {
    marginVertical: 0,
  },
  weeklyCalendarCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
    marginVertical: 0,
    marginBottom: 5,
    height: 120,
  },
  halfWidthChart: {
    width: screenWidth * 0.45,
  },
  actionButtonsContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginLeft: 10,
    height: 200,
  },
  actionButton: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    marginVertical: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
}); 