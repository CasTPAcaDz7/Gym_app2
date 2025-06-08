import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useActivities } from '../hooks/useStorage';

const { width: screenWidth } = Dimensions.get('window');

export default function AddActivityScreen({ navigation, route }) {
  const selectedDate = route?.params?.selectedDate || new Date();
  const editActivity = route?.params?.editActivity;
  const isEdit = route?.params?.isEdit || false;
  const { addActivity, updateActivity, deleteActivity, loading, error, activities } = useActivities();
  
  // 狀態管理 - 如果是編輯模式，使用現有活動的數據初始化
  const [title, setTitle] = useState(editActivity?.title || '');
  const [activityType, setActivityType] = useState(editActivity?.activityType || 'normal'); // 'normal' or 'fitness'
  const [selectedExercise, setSelectedExercise] = useState(editActivity?.selectedExercise || null);
  const [customExerciseName, setCustomExerciseName] = useState(editActivity?.customExerciseName || '');
  const [fitnessGroups, setFitnessGroups] = useState(editActivity?.fitnessGroups || []);
  const [isAllDay, setIsAllDay] = useState(editActivity?.isAllDay ?? true);
  const [startDate, setStartDate] = useState(editActivity ? new Date(editActivity.startDate) : selectedDate);
  const [endDate, setEndDate] = useState(editActivity ? new Date(editActivity.endDate) : selectedDate);
  const [startTime, setStartTime] = useState(editActivity?.startTime || { hour: 9, minute: 0 });
  const [endTime, setEndTime] = useState(editActivity?.endTime || { hour: 10, minute: 0 });
  const [reminderSettings, setReminderSettings] = useState(editActivity?.reminderSettings || ['當天', '1天前']);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [timePickerType, setTimePickerType] = useState('start'); // 'start' or 'end'
  const [tempTime, setTempTime] = useState({ hour: 9, minute: 0 });
  const [selectedColor, setSelectedColor] = useState(editActivity?.color || '#FF4444'); // 預設紅色
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // 搜尋關鍵字
  const [showSuggestions, setShowSuggestions] = useState(false); // 是否顯示建議列表
  const [suggestedActivities, setSuggestedActivities] = useState([]); // 建議的活動列表

  // 初始化效果 - 如果是編輯健身活動且沒有健身組，創建預設健身組
  useEffect(() => {
    if (isEdit && editActivity?.activityType === 'fitness') {
      // 兼容舊版本數據結構
      if (editActivity?.trainingSets && editActivity.trainingSets.length > 0 && (!editActivity?.fitnessGroups || editActivity.fitnessGroups.length === 0)) {
        // 將舊的 trainingSets 轉換為新的 fitnessGroups 格式
        const defaultGroup = {
          id: 'group_1',
          name: editActivity.selectedExercise?.name || editActivity.customExerciseName || '健身項目 1',
          trainingSets: editActivity.trainingSets
        };
        setFitnessGroups([defaultGroup]);
      } else if (!editActivity?.fitnessGroups || editActivity.fitnessGroups.length === 0) {
        createDefaultFitnessGroup();
      }
    }
  }, [isEdit, editActivity]);

  // 可選顏色列表
  const colorOptions = [
    { name: '紅色', value: '#FF4444' },
    { name: '藍色', value: '#4A90E2' },
    { name: '綠色', value: '#7ED321' },
    { name: '橙色', value: '#F5A623' },
    { name: '紫色', value: '#9013FE' },
    { name: '青色', value: '#50E3C2' },
    { name: '粉色', value: '#FF6B9D' },
    { name: '黃色', value: '#FFD700' },
  ];

  // 內置健身項目數據
  const fitnessExercises = [
    { id: 'push_up', name: '伏地挺身', icon: 'account-supervisor', category: '胸部' },
    { id: 'squat', name: '深蹲', icon: 'human-handsdown', category: '腿部' },
    { id: 'plank', name: '平板支撐', icon: 'human-male', category: '核心' },
    { id: 'pull_up', name: '引體向上', icon: 'account-tie', category: '背部' },
    { id: 'burpee', name: 'Burpee', icon: 'run-fast', category: '全身' },
    { id: 'deadlift', name: '硬舉', icon: 'weight-lifter', category: '背部' },
    { id: 'bench_press', name: '臥推', icon: 'dumbbell', category: '胸部' },
    { id: 'lunges', name: '弓步蹲', icon: 'human-handsup', category: '腿部' },
    { id: 'mountain_climber', name: '登山者', icon: 'terrain', category: '核心' },
    { id: 'jumping_jacks', name: '開合跳', icon: 'human-male-height-variant', category: '有氧' },
    { id: 'bicep_curls', name: '二頭彎舉', icon: 'arm-flex', category: '手臂' },
    { id: 'tricep_dips', name: '三頭下壓', icon: 'arm-flex-outline', category: '手臂' },
  ];

  // 格式化日期顯示
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const weekDay = weekDays[date.getDay()];
    return `${year}年${month}月${day}日 ${weekDay}`;
  };

  // 格式化時間顯示
  const formatTime = (time) => {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  // 格式化完整的日期時間顯示
  const formatDateTime = (date, time) => {
    if (isAllDay) {
      return ''; // 全天模式下不顯示任何內容
    }
    return formatTime(time); // 只顯示時間，不顯示日期
  };

  // 處理時間選擇
  const handleTimeSelect = (type) => {
    if (isAllDay) return;
    
    setTimePickerType(type);
    setTempTime(type === 'start' ? startTime : endTime);
    setShowTimePickerModal(true);
  };

  // 確認時間選擇
  const confirmTimeSelection = () => {
    if (timePickerType === 'start') {
      setStartTime(tempTime);
    } else {
      setEndTime(tempTime);
    }
    setShowTimePickerModal(false);
  };

  // 渲染時間選擇器
  const renderTimePicker = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
      <Modal
        visible={showTimePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <TouchableOpacity onPress={() => setShowTimePickerModal(false)}>
                <Text style={styles.timePickerCancel}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.timePickerTitle}>
                選擇{timePickerType === 'start' ? '開始' : '結束'}時間
              </Text>
              <TouchableOpacity onPress={confirmTimeSelection}>
                <Text style={[styles.timePickerConfirm, { color: selectedColor }]}>確定</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timePickerContent}>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>小時</Text>
                <ScrollView style={styles.timePickerList} showsVerticalScrollIndicator={false}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timePickerItem,
                        tempTime.hour === hour && [styles.timePickerItemSelected, { backgroundColor: selectedColor }]
                      ]}
                      onPress={() => setTempTime({ ...tempTime, hour })}
                    >
                      <Text style={[
                        styles.timePickerItemText,
                        tempTime.hour === hour && styles.timePickerItemTextSelected
                      ]}>
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>分鐘</Text>
                <ScrollView style={styles.timePickerList} showsVerticalScrollIndicator={false}>
                  {minutes.filter(m => m % 5 === 0).map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.timePickerItem,
                        tempTime.minute === minute && [styles.timePickerItemSelected, { backgroundColor: selectedColor }]
                      ]}
                      onPress={() => setTempTime({ ...tempTime, minute })}
                    >
                      <Text style={[
                        styles.timePickerItemText,
                        tempTime.minute === minute && styles.timePickerItemTextSelected
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // 渲染健身項目選擇模態框
  const renderExerciseModal = () => {
    return (
      <Modal
        visible={showExerciseModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.exerciseModal}>
            <View style={styles.exerciseModalHeader}>
              <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
                <Text style={styles.exerciseModalCancel}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.exerciseModalTitle}>選擇健身項目</Text>
              <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
                <Text style={[styles.exerciseModalConfirm, { color: selectedColor }]}>完成</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.exerciseModalContent} showsVerticalScrollIndicator={false}>
              {/* 搜尋區域 */}
              <View style={styles.searchSection}>
                <View style={styles.searchInputContainer}>
                  <MaterialCommunityIcons name="magnify" size={20} color="#A9A9A9" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="搜尋健身項目..."
                    placeholderTextColor="#888888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    maxLength={50}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <MaterialCommunityIcons name="close" size={20} color="#A9A9A9" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* 自定義健身項目 */}
              <View style={styles.customExerciseSection}>
                <Text style={styles.customExerciseTitle}>自定義健身項目</Text>
                <View style={styles.customExerciseRow}>
                  <TextInput
                    style={styles.customExerciseInput}
                    placeholder="輸入健身項目名稱"
                    placeholderTextColor="#888888"
                    value={customExerciseName}
                    onChangeText={setCustomExerciseName}
                    maxLength={50}
                  />
                  <TouchableOpacity 
                    style={[styles.customExerciseButton, { backgroundColor: selectedColor }]}
                    onPress={handleCustomExercise}
                    disabled={!customExerciseName.trim()}
                  >
                    <Text style={styles.customExerciseButtonText}>使用</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 分隔線 */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>或選擇內置項目</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* 內置健身項目 */}
              <View style={styles.exerciseGrid}>
                {getFilteredExercises().length > 0 ? (
                  getFilteredExercises().map((exercise) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={[
                        styles.exerciseItem,
                        selectedExercise?.id === exercise.id && styles.exerciseItemSelected
                      ]}
                      onPress={() => handleExerciseSelect(exercise)}
                    >
                      <View style={[styles.exerciseIcon, { backgroundColor: selectedColor + '20' }]}>
                        <MaterialCommunityIcons 
                          name={exercise.icon} 
                          size={32} 
                          color={selectedExercise?.id === exercise.id ? selectedColor : '#ffffff'} 
                        />
                      </View>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseCategory}>{exercise.category}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noResultsContainer}>
                    <MaterialCommunityIcons name="magnify" size={48} color="#4A5657" />
                    <Text style={styles.noResultsText}>找不到相關健身項目</Text>
                    <Text style={styles.noResultsSubtext}>試試其他關鍵字或使用自定義項目</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // 處理保存
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '請輸入活動標題');
      return;
    }

    // 如果是健身項目，確保有健身組且健身組有名稱
    if (activityType === 'fitness') {
      if (!fitnessGroups || fitnessGroups.length === 0) {
        Alert.alert('提示', '請至少添加一個健身項目組');
        return;
      }
      
      // 檢查是否有空的健身組名稱
      const hasEmptyGroupName = fitnessGroups.some(group => !group.name || !group.name.trim());
      if (hasEmptyGroupName) {
        Alert.alert('提示', '請為所有健身項目組輸入名稱');
        return;
      }
    }

    // 構建活動數據
    const activityData = {
      title: title.trim(),
      activityType,
      selectedExercise,
      customExerciseName,
      fitnessGroups,
      isAllDay,
      date: startDate.toISOString(), // 主要日期
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startTime: isAllDay ? null : startTime,
      endTime: isAllDay ? null : endTime,
      reminderSettings,
      color: selectedColor,
      type: activityType === 'fitness' ? 'fitness' : 'activity', // 標記活動類型
      description: '', // 可以後續擴展
      location: '', // 可以後續擴展
    };

    try {
      let result;
      if (isEdit) {
        console.log('開始更新活動:', activityData.title);
        result = await updateActivity(editActivity.id, activityData);
        console.log('更新結果:', result ? '成功' : '失敗');
      } else {
        console.log('開始保存活動:', activityData.title);
        result = await addActivity(activityData);
        console.log('保存結果:', result ? '成功' : '失敗');
      }
      
      if (result) {
        console.log('準備返回月曆頁面，觸發向右滑出動畫');
        // 保存/更新成功後直接使用 goBack() 觸發向右滑出動畫
        navigation.goBack();
      } else {
        Alert.alert('錯誤', error || (isEdit ? '更新失敗，請重試' : '保存失敗，請重試'));
      }
    } catch (err) {
      console.error('Save/Update activity error:', err);
      Alert.alert('錯誤', isEdit ? '更新失敗，請重試' : '保存失敗，請重試');
    }
  };

  // 處理關閉
  const handleClose = () => {
    if (title.trim()) {
      Alert.alert(
        '確認',
        '您有未保存的更改，確定要離開嗎？',
        [
          { text: '取消', style: 'cancel' },
          { text: '離開', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // 處理刪除活動
  const handleDeleteActivity = () => {
    Alert.alert(
      '確認刪除',
      '確定要刪除此活動嗎？此操作無法復原。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '刪除', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('開始刪除活動:', editActivity.id);
              const result = await deleteActivity(editActivity.id);
              console.log('刪除結果:', result ? '成功' : '失敗');
              
              if (result) {
                console.log('準備返回月曆頁面，觸發向右滑出動畫');
                // 刪除成功後直接使用 goBack() 觸發向右滑出動畫
                navigation.goBack();
              } else {
                Alert.alert('錯誤', '刪除失敗，請重試');
              }
            } catch (err) {
              console.error('Delete activity error:', err);
              Alert.alert('錯誤', '刪除失敗，請重試');
            }
          }
        }
      ]
    );
  };

  // 移除提醒
  const removeReminder = (index) => {
    const newReminders = reminderSettings.filter((_, i) => i !== index);
    setReminderSettings(newReminders);
  };

  // 功能按鈕數據
  const functionButtons = [
    { id: 'repeat', icon: 'repeat', label: '重複' },
    { id: 'note', icon: 'note-text', label: '備註' },
    { id: 'checklist', icon: 'check-circle', label: '待辦清單' },
  ];

  // 處理活動類型切換
  const handleActivityTypeChange = (type) => {
    setActivityType(type);
    if (type === 'normal') {
      setSelectedExercise(null);
      setCustomExerciseName('');
      setFitnessGroups([]); // 切換到普通活動時清空健身組
    } else if (type === 'fitness') {
      // 移除自動填寫「標題」的邏輯，讓用戶看到placeholder
      // 如果還沒有健身組，創建預設的健身組
      if (fitnessGroups.length === 0) {
        createDefaultFitnessGroup();
      }
    }
  };

  // 處理健身項目選擇
  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    setTitle(exercise.name);
    setCustomExerciseName('');
    setSearchQuery(''); // 清空搜尋
    setShowExerciseModal(false);
  };

  // 處理自定義健身項目
  const handleCustomExercise = () => {
    if (customExerciseName.trim()) {
      setTitle(customExerciseName.trim());
      setSelectedExercise(null);
      setSearchQuery(''); // 清空搜尋
      setShowExerciseModal(false);
    }
  };

  // 過濾健身項目
  const getFilteredExercises = () => {
    if (!searchQuery.trim()) {
      return fitnessExercises;
    }
    return fitnessExercises.filter(exercise => 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // 創建預設健身組（1個）
  const createDefaultFitnessGroup = () => {
    const defaultGroup = {
      id: 'group_1',
      name: '健身項目 1',
      trainingSets: [
        {
          id: `set_1_1`,
          setNumber: 1,
          previousRecord: '—',
          weight: '',
        },
        {
          id: `set_1_2`,
          setNumber: 2,
          previousRecord: '—',
          weight: '',
        },
        {
          id: `set_1_3`,
          setNumber: 3,
          previousRecord: '—',
          weight: '',
        }
      ],
    };
    setFitnessGroups([defaultGroup]);
  };

  // 更新健身組名稱
  const updateFitnessGroupName = (groupId, name) => {
    setFitnessGroups(fitnessGroups.map(group => 
      group.id === groupId ? { ...group, name } : group
    ));
  };

  // 為特定健身組添加訓練組
  const addTrainingSetToGroup = (groupId) => {
    setFitnessGroups(fitnessGroups.map(group => {
      if (group.id === groupId) {
        const newSet = {
          id: `set_${groupId}_${Date.now()}`,
          setNumber: group.trainingSets.length + 1,
          previousRecord: '—',
          weight: '',
        };
        return { ...group, trainingSets: [...group.trainingSets, newSet] };
      }
      return group;
    }));
  };

  // 更新特定健身組中的訓練組重量
  const updateTrainingSetWeight = (groupId, setId, weight) => {
    setFitnessGroups(fitnessGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          trainingSets: group.trainingSets.map(set => 
            set.id === setId ? { ...set, weight } : set
          )
        };
      }
      return group;
    }));
  };

  // 從特定健身組中刪除訓練組
  const removeTrainingSetFromGroup = (groupId, setId) => {
    setFitnessGroups(fitnessGroups.map(group => {
      if (group.id === groupId) {
        const newSets = group.trainingSets.filter(set => set.id !== setId);
        // 重新編號
        const reNumberedSets = newSets.map((set, index) => ({
          ...set,
          setNumber: index + 1
        }));
        return { ...group, trainingSets: reNumberedSets };
      }
      return group;
    }));
  };

  // 獲取建議重量（從該組的其他訓練組中取最後一個）
  const getSuggestedWeight = (groupId, currentSetId) => {
    const group = fitnessGroups.find(g => g.id === groupId);
    if (!group) return '';
    
    const filledWeights = group.trainingSets
      .filter(set => set.id !== currentSetId && set.weight.trim() !== '')
      .map(set => set.weight);
    return filledWeights.length > 0 ? filledWeights[filledWeights.length - 1] : '';
  };

  // 添加健身組
  const addFitnessGroup = () => {
    const newGroup = {
      id: `group_${Date.now()}`,
      name: `健身項目 ${fitnessGroups.length + 1}`,
      trainingSets: [
        {
          id: `set_${Date.now()}_1`,
          setNumber: 1,
          previousRecord: '—',
          weight: '',
        },
        {
          id: `set_${Date.now()}_2`,
          setNumber: 2,
          previousRecord: '—',
          weight: '',
        },
        {
          id: `set_${Date.now()}_3`,
          setNumber: 3,
          previousRecord: '—',
          weight: '',
        }
      ],
    };
    setFitnessGroups([...fitnessGroups, newGroup]);
  };

  // 刪除健身組
  const removeFitnessGroup = (groupId) => {
    const newGroups = fitnessGroups.filter(group => group.id !== groupId);
    setFitnessGroups(newGroups);
  };

  // 搜尋相似活動
  const searchSimilarActivities = useCallback((inputTitle) => {
    if (!inputTitle.trim() || inputTitle.trim().length < 2) {
      setSuggestedActivities([]);
      setShowSuggestions(false);
      return;
    }

    const searchTerm = inputTitle.trim().toLowerCase();
    const similarActivities = activities
      .filter(activity => {
        // 排除當前正在編輯的活動
        if (isEdit && activity.id === editActivity?.id) return false;
        
        const activityTitle = activity.title.toLowerCase();
        // 包含搜尋詞或相似的活動
        return activityTitle.includes(searchTerm) || searchTerm.includes(activityTitle);
      })
      .sort((a, b) => {
        // 按相似度排序：完全匹配 > 開頭匹配 > 包含匹配
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        
        if (aTitle === searchTerm) return -1;
        if (bTitle === searchTerm) return 1;
        if (aTitle.startsWith(searchTerm)) return -1;
        if (bTitle.startsWith(searchTerm)) return 1;
        return 0;
      })
      .slice(0, 5); // 限制最多5個建議

    setSuggestedActivities(similarActivities);
    setShowSuggestions(similarActivities.length > 0);
  }, [activities, isEdit, editActivity]);

  // 處理標題變更
  const handleTitleChange = useCallback((newTitle) => {
    setTitle(newTitle);
    searchSimilarActivities(newTitle);
  }, [searchSimilarActivities]);

  // 選擇建議的活動
  const selectSuggestedActivity = useCallback((suggestedActivity) => {
    // 復用過去活動的設定
    setTitle(suggestedActivity.title);
    setActivityType(suggestedActivity.activityType || 'normal');
    setSelectedExercise(suggestedActivity.selectedExercise || null);
    setCustomExerciseName(suggestedActivity.customExerciseName || '');
    setFitnessGroups(suggestedActivity.fitnessGroups || []);
    setIsAllDay(suggestedActivity.isAllDay ?? true);
    setStartTime(suggestedActivity.startTime || { hour: 9, minute: 0 });
    setEndTime(suggestedActivity.endTime || { hour: 10, minute: 0 });
    setReminderSettings(suggestedActivity.reminderSettings || ['當天', '1天前']);
    setSelectedColor(suggestedActivity.color || '#FF4444');
    
    // 如果是健身項目但沒有健身組，創建預設健身組
    if ((suggestedActivity.activityType === 'fitness') && (!suggestedActivity.fitnessGroups || suggestedActivity.fitnessGroups.length === 0)) {
      createDefaultFitnessGroup();
    }
    
    // 隱藏建議列表
    setShowSuggestions(false);
    setSuggestedActivities([]);
  }, []);

  // 關閉建議列表
  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setSuggestedActivities([]);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      
      {/* 頂部導航欄 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <MaterialCommunityIcons name="close" size={24} color={selectedColor} />
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          {isEdit && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteActivity}>
              <Text style={styles.deleteButtonText}>刪除</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{isEdit ? '更新' : '保存'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 標題輸入區 */}
        <View style={styles.section}>
          <TextInput
            style={styles.titleInput}
            placeholder="標題"
            placeholderTextColor="#888888"
            value={title}
            onChangeText={handleTitleChange}
            maxLength={100}
          />
          
          {/* 智能建議列表 */}
          {showSuggestions && suggestedActivities.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <View style={styles.suggestionsHeader}>
                <MaterialCommunityIcons name="history" size={16} color="#00CED1" />
                <Text style={styles.suggestionsHeaderText}>相似活動建議</Text>
                <TouchableOpacity onPress={closeSuggestions}>
                  <MaterialCommunityIcons name="close" size={16} color="#A9A9A9" />
                </TouchableOpacity>
              </View>
              {suggestedActivities.map((suggestion, index) => (
                <TouchableOpacity
                  key={`${suggestion.id}_${index}`}
                  style={[
                    styles.suggestionItem,
                    index === suggestedActivities.length - 1 && styles.suggestionItemLast
                  ]}
                  onPress={() => selectSuggestedActivity(suggestion)}
                >
                  <View style={styles.suggestionContent}>
                    <View style={styles.suggestionLeft}>
                      <View style={[styles.suggestionColorDot, { backgroundColor: suggestion.color || '#FF4444' }]} />
                      <View style={styles.suggestionTextContainer}>
                        <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                        <Text style={styles.suggestionDetails}>
                          {suggestion.activityType === 'fitness' ? '健身項目' : '普通活動'} • 
                          {suggestion.isAllDay ? ' 全天' : ` ${suggestion.startTime ? `${suggestion.startTime.hour.toString().padStart(2, '0')}:${suggestion.startTime.minute.toString().padStart(2, '0')}` : ''}~${suggestion.endTime ? `${suggestion.endTime.hour.toString().padStart(2, '0')}:${suggestion.endTime.minute.toString().padStart(2, '0')}` : ''}`}
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#A9A9A9" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 活動類型選擇區域 */}
        <View style={styles.section}>
          <View style={styles.activityTypeSection}>
            <View style={styles.activityTypeSectionHeader}>
              <MaterialCommunityIcons name="shape" size={20} color={selectedColor} />
              <Text style={styles.activityTypeSectionTitle}>活動類型</Text>
            </View>
            <View style={styles.activityTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.activityTypeButton,
                  activityType === 'normal' && [styles.activityTypeButtonSelected, { backgroundColor: selectedColor + '20', borderColor: selectedColor }]
                ]}
                onPress={() => handleActivityTypeChange('normal')}
              >
                <MaterialCommunityIcons 
                  name="calendar-text" 
                  size={24} 
                  color={activityType === 'normal' ? selectedColor : '#ffffff'} 
                />
                <Text style={[
                  styles.activityTypeButtonText,
                  activityType === 'normal' && { color: selectedColor }
                ]}>普通活動</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.activityTypeButton,
                  activityType === 'fitness' && [styles.activityTypeButtonSelected, { backgroundColor: selectedColor + '20', borderColor: selectedColor }]
                ]}
                onPress={() => handleActivityTypeChange('fitness')}
              >
                <MaterialCommunityIcons 
                  name="dumbbell" 
                  size={24} 
                  color={activityType === 'fitness' ? selectedColor : '#ffffff'} 
                />
                <Text style={[
                  styles.activityTypeButtonText,
                  activityType === 'fitness' && { color: selectedColor }
                ]}>健身項目</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 健身項目和訓練組管理區域 - 選擇健身項目類型時顯示 */}
        {activityType === 'fitness' && (
          <View style={styles.section}>
            <View style={styles.fitnessSection}>
              {/* 健身組標題區域 */}
              <View style={styles.fitnessSectionHeader}>
                <View style={styles.fitnessSectionTitleContainer}>
                  <MaterialCommunityIcons name="dumbbell" size={20} color={selectedColor} />
                  <Text style={styles.fitnessSectionTitle}>健身項目組</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.addFitnessGroupButton, { backgroundColor: selectedColor }]}
                  onPress={addFitnessGroup}
                >
                  <MaterialCommunityIcons name="plus" size={16} color="#ffffff" />
                  <Text style={styles.addFitnessGroupButtonText}>新增</Text>
                </TouchableOpacity>
              </View>

              {/* 健身組列表 */}
              {fitnessGroups.length > 0 ? (
                fitnessGroups.map((group, groupIndex) => (
                  <View key={group.id} style={styles.fitnessGroupContainer}>
                    {/* 健身組標題和操作 */}
                    <View style={styles.fitnessGroupHeader}>
                      <TextInput
                        style={styles.fitnessGroupNameInput}
                        value={group.name}
                        onChangeText={(text) => updateFitnessGroupName(group.id, text)}
                        placeholder="健身項目名稱"
                        placeholderTextColor="#888888"
                        maxLength={50}
                      />
                      <View style={styles.fitnessGroupActions}>
                        <TouchableOpacity 
                          style={[styles.addTrainingSetButton, { backgroundColor: selectedColor }]}
                          onPress={() => addTrainingSetToGroup(group.id)}
                        >
                          <MaterialCommunityIcons name="plus" size={14} color="#ffffff" />
                        </TouchableOpacity>
                        {fitnessGroups.length > 1 && (
                          <TouchableOpacity 
                            style={styles.removeFitnessGroupButton}
                            onPress={() => removeFitnessGroup(group.id)}
                          >
                            <MaterialCommunityIcons name="trash-can" size={14} color="#FF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* 訓練組表格標題 */}
                    <View style={styles.trainingSetsTableHeader}>
                      <View style={styles.setNumberHeaderContainer}>
                        <Text style={styles.tableHeaderText}>組別</Text>
                      </View>
                      <View style={styles.previousRecordHeaderContainer}>
                        <Text style={styles.tableHeaderText}>上次記錄</Text>
                      </View>
                      <View style={styles.weightHeaderContainer}>
                        <Text style={styles.tableHeaderText}>本次重量</Text>
                      </View>
                      <View style={styles.actionHeaderContainer}>
                        <Text style={styles.tableHeaderText}>操作</Text>
                      </View>
                    </View>

                    {/* 訓練組列表 */}
                    {group.trainingSets.map((set) => (
                      <View key={set.id} style={styles.trainingSetRow}>
                        <View style={styles.setNumberContainer}>
                          <Text style={styles.setNumber}>{set.setNumber}</Text>
                        </View>
                        
                        <View style={styles.previousRecordContainer}>
                          <Text style={styles.previousRecord}>{set.previousRecord}</Text>
                        </View>
                        
                        <View style={styles.weightContainer}>
                          <View style={styles.weightInputWrapper}>
                            <TextInput
                              style={styles.weightInput}
                              value={set.weight}
                              onChangeText={(text) => updateTrainingSetWeight(group.id, set.id, text)}
                              placeholder="重量"
                              placeholderTextColor="#666666"
                              maxLength={20}
                            />
                            {set.weight.trim() === '' && getSuggestedWeight(group.id, set.id) && (
                              <Text style={styles.suggestedWeight}>
                                {getSuggestedWeight(group.id, set.id)}
                              </Text>
                            )}
                          </View>
                        </View>

                        <View style={styles.actionContainer}>
                          <TouchableOpacity 
                            style={styles.removeSetButton}
                            onPress={() => removeTrainingSetFromGroup(group.id, set.id)}
                          >
                            <MaterialCommunityIcons name="close" size={16} color="#FF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}

                    {/* 如果該組沒有訓練組 */}
                    {group.trainingSets.length === 0 && (
                      <View style={styles.emptyTrainingSets}>
                        <MaterialCommunityIcons name="dumbbell" size={24} color="#4A5657" />
                        <Text style={styles.emptyTrainingSetsText}>尚未添加訓練組</Text>
                        <Text style={styles.emptyTrainingSetsSubtext}>點擊上方+號添加訓練組</Text>
                      </View>
                    )}

                    {/* 組之間的分隔線 */}
                    {groupIndex < fitnessGroups.length - 1 && (
                      <View style={styles.groupDivider} />
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyFitnessGroups}>
                  <MaterialCommunityIcons name="dumbbell" size={48} color="#4A5657" />
                  <Text style={styles.emptyFitnessGroupsText}>載入預設健身組中...</Text>
                  <Text style={styles.emptyFitnessGroupsSubtext}>即將為您準備1個預設健身組</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 顏色選擇區域 */}
        <View style={styles.section}>
          <View style={styles.colorSection}>
            <View style={styles.colorSectionHeader}>
              <MaterialCommunityIcons name="palette" size={20} color={selectedColor} />
              <Text style={styles.colorSectionTitle}>活動顏色</Text>
            </View>
            <View style={styles.colorOptionsContainer}>
              {colorOptions.map((color) => {
                const isSelected = selectedColor === color.value;
                return (
                  <TouchableOpacity
                    key={color.value}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color.value },
                      isSelected ? styles.colorOptionSelected : null
                    ]}
                    onPress={() => setSelectedColor(color.value)}
                  >
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={16} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 全天開關 */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <MaterialCommunityIcons name="clock" size={20} color={selectedColor} />
              <Text style={styles.switchLabel}>全天</Text>
            </View>
            <Switch
              value={isAllDay}
              onValueChange={setIsAllDay}
              trackColor={{ false: '#333333', true: selectedColor }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* 時間設置區域 */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.timeRow, isAllDay && styles.timeRowDisabled]} 
            onPress={() => handleTimeSelect('start')}
            disabled={isAllDay}
          >
            <View style={styles.timeLeft}>
              <MaterialCommunityIcons 
                name="clock-start" 
                size={20} 
                color={isAllDay ? "#666666" : selectedColor} 
              />
              <Text style={[styles.timeLabel, isAllDay && styles.timeLabelDisabled]}>開始</Text>
            </View>
            <View style={styles.timeRight}>
              {!isAllDay && (
                <>
                  <Text style={styles.timeValue}>
                    {formatDateTime(startDate, startTime)}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#888888" />
                </>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.timeRow, isAllDay && styles.timeRowDisabled]} 
            onPress={() => handleTimeSelect('end')}
            disabled={isAllDay}
          >
            <View style={styles.timeLeft}>
              <MaterialCommunityIcons 
                name="clock-end" 
                size={20} 
                color={isAllDay ? "#666666" : selectedColor} 
              />
              <Text style={[styles.timeLabel, isAllDay && styles.timeLabelDisabled]}>結束</Text>
            </View>
            <View style={styles.timeRight}>
              {!isAllDay && (
                <>
                  <Text style={styles.timeValue}>
                    {formatDateTime(endDate, endTime)}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#888888" />
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* 提醒設置 */}
        <View style={styles.section}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderLeft}>
              <MaterialCommunityIcons name="alarm" size={20} color={selectedColor} />
              <Text style={styles.reminderText}>
                {reminderSettings.join('、')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReminderSettings([])}>
              <MaterialCommunityIcons name="close" size={20} color="#888888" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 功能按鈕區域 */}
        <View style={styles.functionSection}>
          <View style={styles.functionGrid}>
            {functionButtons.map((button, index) => (
              <TouchableOpacity
                key={button.id}
                style={styles.functionButton}
                onPress={() => {
                  console.log(`點擊 ${button.label}`);
                }}
              >
                <MaterialCommunityIcons 
                  name={button.icon} 
                  size={24} 
                  color={button.color || "#ffffff"} 
                />
                <Text style={styles.functionButtonText}>{button.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 時間選擇器模態框 */}
      {renderTimePicker()}

      {/* 健身項目選擇模態框 */}
      {renderExerciseModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3A3B',
    backgroundColor: '#1C2526',
  },
  closeButton: {
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF4444', // 紅色背景表示危險操作
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 12, // 與保存按鈕的間距
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#00CED1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  section: {
    backgroundColor: '#2E3A3B',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  titleInput: {
    color: '#ffffff',
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontWeight: '500',
    backgroundColor: '#2E3A3B',
    borderWidth: 1,
    borderColor: '#4A5657',
    borderRadius: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1C2526',
  },
  timeRowDisabled: {
    backgroundColor: '#1C2526',
  },
  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
  timeLabelDisabled: {
    color: '#A9A9A9',
  },
  timeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeValue: {
    color: '#A9A9A9',
    fontSize: 16,
    marginRight: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
  functionSection: {
    padding: 16,
  },
  functionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  functionButton: {
    width: (screenWidth - 48) / 3,
    aspectRatio: 2.5,
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  functionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  colorSection: {
    padding: 16,
  },
  colorSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorSectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  colorOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#00CED1',
    shadowColor: '#00CED1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 37, 38, 0.8)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: '#2E3A3B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C2526',
  },
  timePickerCancel: {
    color: '#A9A9A9',
    fontSize: 16,
  },
  timePickerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timePickerConfirm: {
    fontSize: 16,
    fontWeight: '600',
  },
  timePickerContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  timePickerColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  timePickerLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  timePickerList: {
    height: 200,
  },
  timePickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  timePickerItemSelected: {
    // 動態背景色在組件中設置
  },
  timePickerItemText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
  },
  timePickerItemTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  exerciseModal: {
    backgroundColor: '#2E3A3B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  exerciseModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C2526',
  },
  exerciseModalCancel: {
    color: '#A9A9A9',
    fontSize: 16,
  },
  exerciseModalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseModalConfirm: {
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseModalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchSection: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5657',
    borderRadius: 8,
    padding: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  customExerciseSection: {
    padding: 16,
  },
  customExerciseTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  customExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customExerciseInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4A5657',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  customExerciseButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  customExerciseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4A5657',
  },
  dividerText: {
    color: '#A9A9A9',
    fontSize: 14,
    marginHorizontal: 16,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  exerciseItem: {
    width: (screenWidth - 64) / 3,
    backgroundColor: '#1C2526',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exerciseItemSelected: {
    borderColor: '#00CED1',
    backgroundColor: '#2E3A3B',
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseCategory: {
    color: '#A9A9A9',
    fontSize: 12,
    textAlign: 'center',
  },
  activityTypeSection: {
    padding: 16,
  },
  activityTypeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTypeSectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  activityTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityTypeButton: {
    width: (screenWidth - 48) / 2,
    aspectRatio: 2.5,
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityTypeButtonSelected: {
    borderColor: '#00CED1',
  },
  activityTypeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  fitnessSection: {
    padding: 16,
  },
  fitnessSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fitnessSectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fitnessSectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  addFitnessGroupButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFitnessGroupButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  fitnessGroupContainer: {
    marginBottom: 16,
  },
  fitnessGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  fitnessGroupNameInput: {
    flex: 0.7,
    color: '#ffffff',
    fontSize: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#4A5657',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  fitnessGroupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  addTrainingSetButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  removeFitnessGroupButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  trainingSetsTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4A5657',
    marginBottom: 8,
    paddingRight: 0,
  },
  setNumberHeaderContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  previousRecordHeaderContainer: {
    width: 60,
    alignItems: 'center',
    marginRight: 12,
  },
  weightHeaderContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40, // 為刪除按鈕留出空間 (8 + 32)
  },
  tableHeaderText: {
    color: '#A9A9A9',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionHeaderContainer: {
    width: 40,
    alignItems: 'center',
  },
  trainingSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  setNumberContainer: {
    width: 50,
    height: 40,
    backgroundColor: '#1C2526',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  setNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previousRecordContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previousRecord: {
    color: '#A9A9A9',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  weightContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightInputWrapper: {
    flex: 1,
    position: 'relative',
    marginRight: 8, // 與刪除按鈕的間距
  },
  weightInput: {
    color: '#ffffff',
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#4A5657',
    borderRadius: 8,
    backgroundColor: '#1C2526',
    textAlign: 'center',
  },
  suggestedWeight: {
    color: '#A9A9A9',
    fontSize: 14,
    textAlign: 'center',
  },
  actionContainer: {
    width: 32,
    alignItems: 'center',
  },
  removeSetButton: {
    padding: 8,
    width: 32, // 固定寬度
    alignItems: 'center',
  },
  emptyTrainingSets: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyTrainingSetsText: {
    color: '#A9A9A9',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyTrainingSetsSubtext: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyFitnessGroups: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFitnessGroupsText: {
    color: '#A9A9A9',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyFitnessGroupsSubtext: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  groupDivider: {
    height: 1,
    backgroundColor: '#4A5657',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#1C2526',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2E3A3B',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4A5657',
  },
  suggestionsHeaderText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#4A5657',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionDetails: {
    color: '#A9A9A9',
    fontSize: 12,
  },
}); 