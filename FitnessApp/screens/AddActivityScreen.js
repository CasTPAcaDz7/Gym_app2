import React, { useState } from 'react';
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
  const { addActivity, loading, error } = useActivities();
  
  // 狀態管理
  const [title, setTitle] = useState('');
  const [isAllDay, setIsAllDay] = useState(true);
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState({ hour: 9, minute: 0 });
  const [endTime, setEndTime] = useState({ hour: 10, minute: 0 });
  const [reminderSettings, setReminderSettings] = useState(['當天', '1天前']);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [timePickerType, setTimePickerType] = useState('start'); // 'start' or 'end'
  const [tempTime, setTempTime] = useState({ hour: 9, minute: 0 });
  const [selectedColor, setSelectedColor] = useState('#FF4444'); // 預設紅色

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

  // 處理保存
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '請輸入活動標題');
      return;
    }

    // 構建活動數據
    const activityData = {
      title: title.trim(),
      isAllDay,
      date: startDate.toISOString(), // 主要日期
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startTime: isAllDay ? null : startTime,
      endTime: isAllDay ? null : endTime,
      reminderSettings,
      color: selectedColor,
      type: 'activity', // 標記為活動類型
      description: '', // 可以後續擴展
      location: '', // 可以後續擴展
    };

    try {
      const result = await addActivity(activityData);
      
      if (result) {
        Alert.alert('成功', '活動已保存', [
          {
            text: '確定',
            onPress: () => {
              // 返回日曆頁面並刷新
              navigation.navigate('Calendar', { refresh: true });
            },
          },
        ]);
      } else {
        Alert.alert('錯誤', error || '保存失敗，請重試');
      }
    } catch (err) {
      console.error('Save activity error:', err);
      Alert.alert('錯誤', '保存失敗，請重試');
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* 頂部導航欄 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <MaterialCommunityIcons name="close" size={24} color={selectedColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 標題輸入區 */}
        <View style={styles.section}>
          <TextInput
            style={styles.titleInput}
            placeholder="標題"
            placeholderTextColor="#888888"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

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
                onPress={() => console.log(`點擊 ${button.label}`)}
              >
                <MaterialCommunityIcons 
                  name={button.icon} 
                  size={24} 
                  color="#ffffff" 
                />
                <Text style={styles.functionButtonText}>{button.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 時間選擇器模態框 */}
      {renderTimePicker()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  titleInput: {
    color: '#ffffff',
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontWeight: '500',
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
  },
  timeRowDisabled: {
    backgroundColor: '#333333',
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
    color: '#666666',
  },
  timeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeValue: {
    color: '#888888',
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
    backgroundColor: '#333333',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: '#1a1a1a',
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
    borderBottomColor: '#333333',
  },
  timePickerCancel: {
    color: '#888888',
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
}); 