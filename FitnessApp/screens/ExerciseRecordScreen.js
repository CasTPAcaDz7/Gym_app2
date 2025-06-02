import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 運動類型和每分鐘消耗卡路里 (基於70kg體重)
const EXERCISE_TYPES = [
  { id: '1', name: '跑步', icon: 'run', caloriesPerMinute: 12, color: '#E74C3C' },
  { id: '2', name: '健身房訓練', icon: 'dumbbell', caloriesPerMinute: 8, color: '#2E86AB' },
  { id: '3', name: '騎車', icon: 'bike', caloriesPerMinute: 9, color: '#F39C12' },
  { id: '4', name: '游泳', icon: 'swim', caloriesPerMinute: 11, color: '#3498DB' },
  { id: '5', name: '瑜伽', icon: 'meditation', caloriesPerMinute: 3, color: '#9B59B6' },
  { id: '6', name: '走路', icon: 'walk', caloriesPerMinute: 4, color: '#27AE60' },
  { id: '7', name: '舞蹈', icon: 'human-female-dance', caloriesPerMinute: 6, color: '#E91E63' },
  { id: '8', name: '登山', icon: 'terrain', caloriesPerMinute: 10, color: '#795548' },
];

export default function ExerciseRecordScreen({ navigation }) {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [duration, setDuration] = useState('');
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    loadExerciseData();
  }, []);

  const loadExerciseData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const exerciseData = await AsyncStorage.getItem(`exercise_${today}`);
      
      if (exerciseData) {
        const exercises = JSON.parse(exerciseData);
        setExerciseHistory(exercises);
        calculateTodayTotal(exercises);
      }
    } catch (error) {
      console.error('載入運動數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTodayTotal = (exercises) => {
    const total = exercises.reduce((sum, exercise) => sum + exercise.caloriesBurned, 0);
    setTodayTotal(total);
  };

  const calculateCalories = (exerciseType, minutes) => {
    return Math.round(exerciseType.caloriesPerMinute * minutes);
  };

  const saveExerciseRecord = async () => {
    if (!selectedExercise) {
      Alert.alert('錯誤', '請選擇運動類型');
      return;
    }

    const durationNum = parseInt(duration);
    if (!duration || isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('錯誤', '請輸入有效的運動時間');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const caloriesBurned = calculateCalories(selectedExercise, durationNum);
      
      const newExercise = {
        id: Date.now().toString(),
        type: selectedExercise.name,
        icon: selectedExercise.icon,
        color: selectedExercise.color,
        duration: durationNum,
        caloriesBurned: caloriesBurned,
        timestamp: new Date().toISOString(),
        timeDisplay: new Date().toLocaleTimeString('zh-TW', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      };

      const existingData = await AsyncStorage.getItem(`exercise_${today}`);
      const exercises = existingData ? JSON.parse(existingData) : [];
      
      exercises.push(newExercise);
      
      await AsyncStorage.setItem(`exercise_${today}`, JSON.stringify(exercises));
      
      setExerciseHistory(exercises);
      calculateTodayTotal(exercises);
      
      // 重置表單
      setSelectedExercise(null);
      setDuration('');
      
      Alert.alert('成功', `已記錄 ${selectedExercise.name} ${durationNum} 分鐘，消耗 ${caloriesBurned} 卡路里`);
    } catch (error) {
      console.error('保存運動記錄失敗:', error);
      Alert.alert('錯誤', '保存失敗，請稍後再試');
    }
  };

  const deleteExerciseRecord = async (exerciseId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const updatedExercises = exerciseHistory.filter(exercise => exercise.id !== exerciseId);
      
      await AsyncStorage.setItem(`exercise_${today}`, JSON.stringify(updatedExercises));
      setExerciseHistory(updatedExercises);
      calculateTodayTotal(updatedExercises);
      
      Alert.alert('成功', '記錄已刪除');
    } catch (error) {
      console.error('刪除運動記錄失敗:', error);
      Alert.alert('錯誤', '刪除失敗');
    }
  };

  const renderExerciseTypes = () => (
    <View style={styles.exerciseTypesCard}>
      <Text style={styles.sectionTitle}>選擇運動類型</Text>
      <View style={styles.exerciseGrid}>
        {EXERCISE_TYPES.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseTypeItem,
              selectedExercise?.id === exercise.id && styles.selectedExerciseType,
              { borderColor: exercise.color }
            ]}
            onPress={() => setSelectedExercise(exercise)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name={exercise.icon} 
              size={24} 
              color={selectedExercise?.id === exercise.id ? '#ffffff' : exercise.color} 
            />
            <Text style={[
              styles.exerciseTypeName,
              selectedExercise?.id === exercise.id && styles.selectedExerciseTypeName
            ]}>
              {exercise.name}
            </Text>
            <Text style={styles.exerciseCalories}>
              {exercise.caloriesPerMinute} 卡/分鐘
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExerciseForm = () => {
    const estimatedCalories = selectedExercise && duration 
      ? calculateCalories(selectedExercise, parseInt(duration) || 0) 
      : 0;

    return (
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>記錄運動</Text>
        
        {selectedExercise && (
          <View style={styles.selectedExerciseInfo}>
            <MaterialCommunityIcons 
              name={selectedExercise.icon} 
              size={20} 
              color={selectedExercise.color} 
            />
            <Text style={styles.selectedExerciseName}>{selectedExercise.name}</Text>
          </View>
        )}

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>運動時間 (分鐘)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor="#A9A9A9"
          />
        </View>

        {estimatedCalories > 0 && (
          <View style={styles.caloriesPreview}>
            <Text style={styles.previewLabel}>預估消耗卡路里</Text>
            <Text style={styles.previewValue}>{estimatedCalories} 卡</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!selectedExercise || !duration) && styles.disabledButton
          ]}
          onPress={saveExerciseRecord}
          disabled={!selectedExercise || !duration}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="content-save" size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>保存記錄</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTodayStats = () => (
    <View style={styles.statsCard}>
      <Text style={styles.sectionTitle}>今日統計</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="fire" size={24} color="#E74C3C" />
          <Text style={styles.statValue}>{todayTotal}</Text>
          <Text style={styles.statLabel}>消耗卡路里</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clock" size={24} color="#00CED1" />
          <Text style={styles.statValue}>
            {exerciseHistory.reduce((sum, exercise) => sum + exercise.duration, 0)}
          </Text>
          <Text style={styles.statLabel}>運動分鐘</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="chart-line" size={24} color="#27AE60" />
          <Text style={styles.statValue}>{exerciseHistory.length}</Text>
          <Text style={styles.statLabel}>運動次數</Text>
        </View>
      </View>
    </View>
  );

  const renderExerciseHistory = () => {
    const renderHistoryItem = ({ item }) => (
      <View style={styles.historyItem}>
        <View style={styles.historyIcon}>
          <MaterialCommunityIcons 
            name={item.icon} 
            size={20} 
            color={item.color} 
          />
        </View>
        <View style={styles.historyInfo}>
          <Text style={styles.historyType}>{item.type}</Text>
          <Text style={styles.historyDetails}>
            {item.duration} 分鐘 • {item.caloriesBurned} 卡路里 • {item.timeDisplay}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              '確認刪除',
              '確定要刪除這筆運動記錄嗎？',
              [
                { text: '取消', style: 'cancel' },
                { text: '刪除', style: 'destructive', onPress: () => deleteExerciseRecord(item.id) }
              ]
            );
          }}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    );

    return (
      <View style={styles.historyCard}>
        <Text style={styles.sectionTitle}>今日運動記錄</Text>
        {exerciseHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="dumbbell" size={40} color="#A9A9A9" />
            <Text style={styles.emptyText}>還沒有運動記錄</Text>
            <Text style={styles.emptySubtext}>開始記錄您的運動</Text>
          </View>
        ) : (
          <FlatList
            data={exerciseHistory}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTodayStats()}
        {renderExerciseTypes()}
        {renderExerciseForm()}
        {renderExerciseHistory()}
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
    paddingHorizontal: 15,
  },
  scrollViewContent: {
    paddingBottom: 100,
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
    fontSize: 16,
  },

  // 卡片樣式
  exerciseTypesCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  formCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  statsCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  historyCard: {
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

  // 運動類型選擇樣式
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  exerciseTypeItem: {
    width: '48%',
    backgroundColor: '#1C2526',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  selectedExerciseType: {
    backgroundColor: '#00CED1',
    borderColor: '#00CED1',
  },
  exerciseTypeName: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 5,
    textAlign: 'center',
  },
  selectedExerciseTypeName: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  exerciseCalories: {
    fontSize: 10,
    color: '#A9A9A9',
    marginTop: 2,
  },

  // 表單樣式
  selectedExerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2526',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  selectedExerciseName: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1C2526',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  caloriesPreview: {
    backgroundColor: '#1C2526',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 5,
  },
  previewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  saveButton: {
    backgroundColor: '#00CED1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#4A5657',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // 統計樣式
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 5,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#A9A9A9',
  },

  // 歷史記錄樣式
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#A9A9A9',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#A9A9A9',
    marginTop: 5,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4A5657',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C2526',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 2,
  },
  historyDetails: {
    fontSize: 12,
    color: '#A9A9A9',
  },
  deleteButton: {
    padding: 8,
  },
}); 