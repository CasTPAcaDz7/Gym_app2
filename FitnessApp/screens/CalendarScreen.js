import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useActivities } from '../hooks/useStorage';

const { width: screenWidth } = Dimensions.get('window');

export default function CalendarScreen({ route }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // 新增選擇的日期狀態
  const [selectedDateActivities, setSelectedDateActivities] = useState([]);
  const [monthActivities, setMonthActivities] = useState({}); // 儲存整個月的活動數據
  const navigation = useNavigation();
  const { loadActivitiesByDate, loading, error } = useActivities();

  // 中文星期標籤
  const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  // 載入指定日期的活動
  const loadDateActivities = useCallback(async (date) => {
    try {
      const activities = await loadActivitiesByDate(date);
      setSelectedDateActivities(activities || []);
    } catch (err) {
      console.error('Load activities error:', err);
      setSelectedDateActivities([]);
    }
  }, [loadActivitiesByDate]);

  // 載入整個月的活動數據（用於顯示指示點）
  const loadMonthActivities = useCallback(async () => {
    const monthDays = getMonthDays();
    const activitiesMap = {};
    
    // 為每個日期載入活動
    const promises = monthDays.map(async (date) => {
      const dateKey = date.toDateString();
      try {
        const activities = await loadActivitiesByDate(date);
        activitiesMap[dateKey] = activities || [];
      } catch (err) {
        console.error('Load month activities error:', err);
        activitiesMap[dateKey] = [];
      }
    });

    await Promise.all(promises);
    setMonthActivities(activitiesMap);
  }, [loadActivitiesByDate, currentDate]);

  // 當選中日期改變時載入活動
  useEffect(() => {
    loadDateActivities(selectedDate);
  }, [selectedDate, loadDateActivities]);

  // 當月份改變時載入整個月的活動
  useEffect(() => {
    loadMonthActivities();
  }, [currentDate, loadMonthActivities]);

  // 當頁面重新聚焦時刷新數據
  useFocusEffect(
    useCallback(() => {
      loadDateActivities(selectedDate);
      loadMonthActivities();
    }, [selectedDate, loadDateActivities, loadMonthActivities])
  );

  // 處理從Dashboard傳遞的selectedDate參數
  useEffect(() => {
    if (route?.params?.selectedDate) {
      const passedDate = new Date(route.params.selectedDate);
      setSelectedDate(passedDate);
      setCurrentDate(passedDate); // 同時設置當前月份以確保顯示正確的月份
    }
  }, [route?.params?.selectedDate]);

  // 獲取指定日期的活動數量
  const getActivitiesCountForDate = (date) => {
    const dateKey = date.toDateString();
    return (monthActivities[dateKey] || []).length;
  };

  // 獲取活動圖標和顏色
  const getActivityIcon = (activity) => {
    if (activity.type === 'activity') {
      return 'calendar-outline';
    }
    switch (activity.title.toLowerCase()) {
      case '胸部訓練':
      case '腿部訓練':
      case '背部訓練':
        return 'dumbbell';
      case '跑步':
      case '慢跑':
        return 'run';
      case '瑜伽':
        return 'meditation';
      default:
        return 'calendar-outline';
    }
  };

  const getActivityTypeLabel = (activity) => {
    if (activity.type === 'activity') {
      return '活動';
    }
    return activity.type || '其他';
  };

  // 獲取月份的所有日期
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 月份的第一天
    const firstDay = new Date(year, month, 1);
    
    // 計算日曆開始日期（包含上個月的日期）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 生成6週的日期（42天）
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // 檢查是否為今天
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // 檢查是否為選中的日期
  const isSelectedDate = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // 檢查是否為當前月份
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // 檢查是否為週末（只有星期日需要特殊顏色）
  const isSunday = (date) => {
    return date.getDay() === 0; // 只有星期日
  };

  // 切換月份
  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // 回到今天
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // 處理日期點擊
  const handleDatePress = (date) => {
    setSelectedDate(new Date(date));
  };

  // 處理添加活動
  const handleAddActivity = () => {
    // 導航到添加活動頁面
    navigation.navigate('AddActivity', { selectedDate });
  };

  // 渲染活動列表
  const renderActivities = () => {
    const isSelectedToday = isToday(selectedDate);
    
    return (
      <View style={styles.activitiesContainer}>
        <View style={styles.activitiesHeader}>
          <Text style={styles.activitiesTitle}>
            {isSelectedToday ? '今日活動' : `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日活動`}
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddActivity}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="plus" 
              size={20} 
              color="#ffffff" 
            />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.activitiesScrollView} showsVerticalScrollIndicator={false}>
          {selectedDateActivities.length > 0 ? (
            selectedDateActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <MaterialCommunityIcons 
                    name={getActivityIcon(activity)} 
                    size={20} 
                    color={activity.color || '#FF4444'}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>
                    {activity.isAllDay 
                      ? '全天' 
                      : `${activity.startTime?.hour || 0}:${(activity.startTime?.minute || 0).toString().padStart(2, '0')}`
                    }
                  </Text>
                </View>
                <View style={[styles.activityType, { backgroundColor: (activity.color || '#FF4444') + '20' }]}>
                  <Text style={[styles.activityTypeText, { color: activity.color || '#FF4444' }]}>
                    {getActivityTypeLabel(activity)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noActivitiesContainer}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={40} color="#666666" />
              <Text style={styles.noActivitiesText}>
                {isSelectedToday ? '今日暫無活動' : '該日期暫無活動'}
              </Text>
              {loading && <Text style={styles.loadingText}>載入中...</Text>}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  // 渲染日期單元格
  const renderDateCell = (date, index) => {
    const today = isToday(date);
    const selected = isSelectedDate(date);
    const currentMonth = isCurrentMonth(date);
    const sunday = isSunday(date);
    const activitiesCount = getActivitiesCountForDate(date);

    return (
      <TouchableOpacity
        key={index}
        style={styles.dateCell}
        onPress={() => handleDatePress(date)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.dateCellContent,
          selected && styles.selectedDateCell,
          today && styles.todayDateCell,
        ]}>
          <Text style={[
            styles.dateText,
            !currentMonth && styles.otherMonthText,
            selected && styles.selectedDateText,
            today && styles.todayDateText,
            (sunday && currentMonth && !selected && !today) && styles.highlightText // 只有星期日為紅色
          ]}>
            {date.getDate()}
          </Text>
          
          {/* 活動指示點 */}
          {activitiesCount > 0 && (
            <View style={styles.activityDot} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* 頂部標題欄 */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={styles.titleContainer}>
            <TouchableOpacity 
              style={styles.monthSelector}
              onPress={goToToday}
            >
              <Text style={styles.yearMonthText}>
                {currentDate.getFullYear()}年{months[currentDate.getMonth()]}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#888888" />
            </TouchableOpacity>
            <Text style={styles.subtitleText}>行事曆</Text>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => changeMonth(-1)}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => changeMonth(1)}
          >
            <MaterialCommunityIcons name="chevron-right" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 星期標籤 */}
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 日曆網格 */}
      <View style={styles.calendarGrid}>
        {getMonthDays().map((date, index) => renderDateCell(date, index))}
      </View>

      {/* 活動顯示區域 */}
      {renderActivities()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2526', // 與Dashboard一致
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1C2526', // 與Dashboard一致
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 4,
  },
  titleContainer: {
    flex: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearMonthText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 3,
  },
  subtitleText: {
    fontSize: 11,
    color: '#A9A9A9', // 與Dashboard的次要文字顏色一致
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 6,
    marginLeft: 6,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#2E3A3B', // 使用Dashboard的卡片背景色
    paddingVertical: 8,
    marginTop: 4,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  weekDayText: {
    fontSize: 12,
    color: '#A9A9A9', // 與Dashboard一致
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#2E3A3B', // 使用Dashboard的卡片背景色
  },
  dateCell: {
    width: screenWidth / 7,
    height: screenWidth / 7 * 0.75,
    backgroundColor: '#2E3A3B', // 使用Dashboard的卡片背景色
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dateCellContent: {
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    position: 'relative',
  },
  dateText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  otherMonthText: {
    color: '#4A5657', // 使用Dashboard的邊框顏色
  },
  highlightText: {
    color: '#ff4444',
  },
  todayIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    zIndex: 1,
  },
  todayDateCell: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  todayDateText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  selectedDateCell: {
    backgroundColor: '#00CED1',
    borderRadius: 20,
  },
  selectedDateText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00CED1',
    position: 'absolute',
    bottom: 2,
    alignSelf: 'center',
  },
  // 活動區域樣式
  activitiesContainer: {
    flex: 1,
    backgroundColor: '#1C2526', // 與Dashboard主背景一致
    paddingHorizontal: 16,
    paddingTop: 0, // 完全移除頂部間距
    borderTopWidth: 0, // 移除頂部邊框
    borderTopColor: '#4A5657', // 使用Dashboard的邊框顏色
    minHeight: 200,
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // 減少底部間距，從12改為8
    paddingBottom: 6, // 減少內部底部間距，從8改為6
    paddingTop: 8, // 添加頂部間距來替代容器的間距
    borderBottomWidth: 1,
    borderBottomColor: '#4A5657', // 與Dashboard的邊框顏色一致
  },
  activitiesTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00CED1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00CED1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activitiesScrollView: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E3A3B', // 使用Dashboard的卡片背景色
    borderRadius: 10, // 與Dashboard卡片圓角一致
    padding: 15, // 與Dashboard卡片padding一致
    marginBottom: 10, // 與Dashboard一致
    borderLeftWidth: 3,
    borderLeftColor: '#00CED1',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A5657', // 使用Dashboard的按鈕顏色
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#A9A9A9', // 與Dashboard的次要文字一致
  },
  activityType: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  activityTypeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  noActivitiesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noActivitiesText: {
    fontSize: 16,
    color: '#A9A9A9', // 與Dashboard的次要文字一致
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#A9A9A9',
    marginTop: 8,
  },
}); 