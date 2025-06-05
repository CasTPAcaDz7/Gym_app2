import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated
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
  const [weekActivities, setWeekActivities] = useState({});
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);
  const navigation = useNavigation();
  const { loadActivitiesByDate, deleteActivity, loading, error } = useActivities();

  // 添加動畫狀態
  const slideAnimation = useState(new Animated.Value(0))[0];

  // 確保動畫值與多選模式狀態同步
  useEffect(() => {
    // 當多選模式狀態變化時，確保動畫值正確
    if (!isMultiSelectMode) {
      slideAnimation.setValue(0);
    }
  }, [isMultiSelectMode]);

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

  // 處理 refresh 參數，當從新增活動頁面返回時立即刷新數據
  useEffect(() => {
    if (route?.params?.refresh) {
      // 如果同時有 selectedDate 參數，先設置日期再刷新
      if (route?.params?.selectedDate) {
        const passedDate = new Date(route.params.selectedDate);
        setSelectedDate(passedDate);
        setCurrentDate(passedDate);
        // 稍微延遲刷新，確保日期已更新
        setTimeout(() => {
          loadDateActivities(passedDate);
          loadMonthActivities();
        }, 100);
      } else {
        loadDateActivities(selectedDate);
        loadMonthActivities();
      }
      // 清除參數，避免重複觸發
      navigation.setParams({ refresh: false, selectedDate: null });
    }
  }, [route?.params?.refresh, route?.params?.selectedDate, selectedDate, loadDateActivities, loadMonthActivities, navigation]);

  // 獲取指定日期的活動數量
  const getActivitiesCountForDate = (date) => {
    const dateKey = date.toDateString();
    return (monthActivities[dateKey] || []).length;
  };

  // 獲取指定日期的活動顏色列表（去重且最多5個）
  const getActivityColorsForDate = (date) => {
    const dateKey = date.toDateString();
    const activities = monthActivities[dateKey] || [];
    
    // 提取顏色並去重
    const colors = [...new Set(activities.map(activity => activity.color || '#00CED1'))];
    
    // 限制最多5個顏色
    return colors.slice(0, 5);
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

  // 處理編輯活動
  const handleEditActivity = (activity) => {
    // 如果是多選模式，處理選擇邏輯
    if (isMultiSelectMode) {
      toggleActivitySelection(activity.id);
      return;
    }
    
    // 導航到編輯活動頁面，傳入活動數據
    navigation.navigate('AddActivity', { 
      selectedDate,
      editActivity: activity,
      isEdit: true
    });
  };

  // 切換多選模式
  const toggleMultiSelectMode = () => {
    const newMode = !isMultiSelectMode;
    
    // 停止當前動畫
    slideAnimation.stopAnimation(() => {
      // 設置初始值和目標值
      const fromValue = newMode ? 0 : 1;
      const toValue = newMode ? 1 : 0;
      
      // 確保從正確的值開始
      slideAnimation.setValue(fromValue);
      
      // 更新狀態
      setIsMultiSelectMode(newMode);
      setSelectedActivityIds([]);
      
      // 執行動畫
      Animated.timing(slideAnimation, {
        toValue: toValue,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  // 切換活動選擇狀態
  const toggleActivitySelection = (activityId) => {
    setSelectedActivityIds(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  // 批量刪除選中的活動
  const handleBatchDelete = async () => {
    if (selectedActivityIds.length === 0) {
      Alert.alert('提示', '請先選擇要刪除的活動');
      return;
    }

    console.log('準備批量刪除的活動 IDs:', selectedActivityIds);
    console.log('當前選中日期的活動:', selectedDateActivities);

    Alert.alert(
      '確認刪除',
      `確定要刪除選中的 ${selectedActivityIds.length} 個活動嗎？此操作無法復原。`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '刪除', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('開始批量刪除活動:', selectedActivityIds);
              
              let successCount = 0;
              let failedCount = 0;
              
              // 順序執行刪除操作，避免併發問題
              for (const activityId of selectedActivityIds) {
                try {
                  console.log('正在刪除活動:', activityId);
                  const result = await deleteActivity(activityId);
                  console.log('刪除結果:', result);
                  
                  if (result) {
                    successCount++;
                    console.log('刪除成功:', activityId);
                  } else {
                    failedCount++;
                    console.log('刪除失敗:', activityId, '結果為 false');
                  }
                } catch (err) {
                  console.error('刪除活動時出錯:', activityId, err);
                  failedCount++;
                }
                
                // 添加小延遲避免過快操作
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
              console.log('批量刪除完成，成功:', successCount, '失敗:', failedCount);
              
              // 退出多選模式並重置動畫
              setIsMultiSelectMode(false);
              setSelectedActivityIds([]);
              
              // 重置動畫值
              slideAnimation.setValue(0);
              
              // 延遲刷新數據，確保刪除操作完成
              setTimeout(async () => {
                console.log('開始刷新數據...');
                try {
                  await loadDateActivities(selectedDate);
                  await loadMonthActivities();
                  console.log('數據刷新完成');
                } catch (err) {
                  console.error('刷新數據時出錯:', err);
                }
              }, 200);
              
              if (failedCount === 0) {
                Alert.alert('成功', `已成功刪除 ${successCount} 個活動`);
              } else if (successCount === 0) {
                Alert.alert('失敗', '所有活動刪除失敗，請重試');
              } else {
                Alert.alert('部分成功', `成功刪除 ${successCount} 個活動，${failedCount} 個活動刪除失敗`);
              }
            } catch (err) {
              console.error('Batch delete error:', err);
              Alert.alert('錯誤', '批量刪除失敗，請重試');
            }
          }
        }
      ]
    );
  };

  // 渲染活動列表
  const renderActivities = () => {
    const isSelectedToday = isToday(selectedDate);
    
    return (
      <View style={styles.activitiesContainer}>
        <View style={styles.activitiesHeader}>
          <Text style={styles.activitiesTitle}>
            {isSelectedToday ? '今日活動' : `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日活動`}
            {isMultiSelectMode && selectedActivityIds.length > 0 && (
              <Text style={styles.selectedCountText}> ({selectedActivityIds.length} 已選)</Text>
            )}
          </Text>
          
          <View style={styles.headerButtons}>
            {isMultiSelectMode ? (
              <>
                {selectedActivityIds.length > 0 && (
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={handleBatchDelete}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name="delete" 
                      size={18} 
                      color="#ffffff" 
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={toggleMultiSelectMode}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons 
                    name="close" 
                    size={18} 
                    color="#ffffff" 
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                {selectedDateActivities.length > 0 && (
                  <TouchableOpacity 
                    style={styles.moreButton}
                    onPress={toggleMultiSelectMode}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name="dots-horizontal" 
                      size={20} 
                      color="#A9A9A9" 
                    />
                  </TouchableOpacity>
                )}
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
              </>
            )}
          </View>
        </View>
        
        <ScrollView style={styles.activitiesScrollView} showsVerticalScrollIndicator={false}>
          {selectedDateActivities.length > 0 ? (
            selectedDateActivities.map((activity) => {
              const animatedMarginLeft = slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 40], // 向右移動40像素為復選框讓出空間
              });
              
              return (
                <TouchableOpacity
                  key={activity.id} 
                  style={[
                    styles.activityItem,
                    isMultiSelectMode && selectedActivityIds.includes(activity.id) && styles.selectedActivityItem
                  ]}
                  onPress={() => handleEditActivity(activity)}
                  activeOpacity={0.7}
                >
                  {isMultiSelectMode && (
                    <Animated.View 
                      style={[
                        styles.checkboxContainer,
                        {
                          opacity: slideAnimation,
                          transform: [{
                            translateX: slideAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-40, 0], // 復選框從左邊滑入
                            })
                          }]
                        }
                      ]}
                    >
                      <MaterialCommunityIcons 
                        name={selectedActivityIds.includes(activity.id) ? "checkbox-marked" : "checkbox-blank-outline"} 
                        size={24} 
                        color={selectedActivityIds.includes(activity.id) ? "#00CED1" : "#A9A9A9"} 
                      />
                    </Animated.View>
                  )}
                  <Animated.View 
                    style={[
                      styles.activityContentContainer,
                      {
                        marginLeft: isMultiSelectMode ? animatedMarginLeft : 0,
                      }
                    ]}
                  >
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
                  </Animated.View>
                </TouchableOpacity>
              );
            })
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
    const activityColors = getActivityColorsForDate(date);

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
          
          {/* 活動顏色指示點 */}
          {activityColors.length > 0 && (
            <View style={styles.activityDotsContainer}>
              {activityColors.map((color, colorIndex) => (
                <View 
                  key={colorIndex} 
                  style={[styles.activityColorDot, { backgroundColor: color }]} 
                />
              ))}
            </View>
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
  activityDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  activityColorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCountText: {
    fontSize: 12,
    color: '#A9A9A9',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 6,
    marginRight: 6,
  },
  cancelButton: {
    padding: 6,
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
  moreButton: {
    padding: 6,
    marginRight: 6,
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
  selectedActivityItem: {
    backgroundColor: '#003842', // 深色青色背景表示選中
  },
  checkboxContainer: {
    position: 'absolute',
    left: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  activityContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
}); 