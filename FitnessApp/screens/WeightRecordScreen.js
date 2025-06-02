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

export default function WeightRecordScreen({ navigation }) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('170'); // 默認身高
  const [weightHistory, setWeightHistory] = useState([]);
  const [currentBMI, setCurrentBMI] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeightData();
  }, []);

  const loadWeightData = async () => {
    try {
      const weightData = await AsyncStorage.getItem('weight_records');
      const heightData = await AsyncStorage.getItem('user_height');
      
      if (weightData) {
        const records = JSON.parse(weightData);
        setWeightHistory(records.sort((a, b) => new Date(b.date) - new Date(a.date)));
        
        if (records.length > 0) {
          const latestWeight = records[0].weight;
          setWeight(latestWeight.toString());
        }
      }
      
      if (heightData) {
        setHeight(heightData);
      }
      
    } catch (error) {
      console.error('載入體重數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = (weightValue, heightValue) => {
    const weightNum = parseFloat(weightValue);
    const heightNum = parseFloat(heightValue);
    
    if (weightNum > 0 && heightNum > 0) {
      const heightInMeters = heightNum / 100;
      return (weightNum / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 0;
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { status: '體重過輕', color: '#3498DB' };
    if (bmi < 24) return { status: '正常範圍', color: '#27AE60' };
    if (bmi < 27) return { status: '體重過重', color: '#F39C12' };
    if (bmi < 30) return { status: '輕度肥胖', color: '#E67E22' };
    return { status: '中重度肥胖', color: '#E74C3C' };
  };

  const saveWeightRecord = async () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('錯誤', '請輸入有效的體重');
      return;
    }

    if (!height || isNaN(heightNum) || heightNum <= 0) {
      Alert.alert('錯誤', '請輸入有效的身高');
      return;
    }

    try {
      const newRecord = {
        id: Date.now().toString(),
        weight: weightNum,
        bmi: parseFloat(calculateBMI(weight, height)),
        date: new Date().toISOString(),
        dateDisplay: new Date().toLocaleDateString('zh-TW'),
      };

      const existingRecords = await AsyncStorage.getItem('weight_records');
      const records = existingRecords ? JSON.parse(existingRecords) : [];
      
      // 檢查今天是否已有記錄
      const today = new Date().toDateString();
      const todayRecordIndex = records.findIndex(record => 
        new Date(record.date).toDateString() === today
      );

      if (todayRecordIndex >= 0) {
        // 更新今天的記錄
        records[todayRecordIndex] = newRecord;
      } else {
        // 添加新記錄
        records.unshift(newRecord);
      }

      await AsyncStorage.setItem('weight_records', JSON.stringify(records));
      await AsyncStorage.setItem('user_height', height);

      setWeightHistory(records);
      setCurrentBMI(newRecord.bmi);

      Alert.alert('成功', '體重記錄已保存');
    } catch (error) {
      console.error('保存體重記錄失敗:', error);
      Alert.alert('錯誤', '保存失敗，請稍後再試');
    }
  };

  const deleteWeightRecord = async (recordId) => {
    try {
      const updatedRecords = weightHistory.filter(record => record.id !== recordId);
      await AsyncStorage.setItem('weight_records', JSON.stringify(updatedRecords));
      setWeightHistory(updatedRecords);
      Alert.alert('成功', '記錄已刪除');
    } catch (error) {
      console.error('刪除記錄失敗:', error);
      Alert.alert('錯誤', '刪除失敗');
    }
  };

  const renderWeightForm = () => {
    const bmi = calculateBMI(weight, height);
    const bmiStatus = getBMIStatus(parseFloat(bmi));

    return (
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>記錄體重</Text>
        
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>身高 (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="170"
            placeholderTextColor="#A9A9A9"
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>體重 (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="70.0"
            placeholderTextColor="#A9A9A9"
          />
        </View>

        {weight && height && (
          <View style={styles.bmiSection}>
            <Text style={styles.bmiTitle}>BMI 計算</Text>
            <View style={styles.bmiContainer}>
              <Text style={styles.bmiValue}>{bmi}</Text>
              <Text style={[styles.bmiStatus, { color: bmiStatus.color }]}>
                {bmiStatus.status}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveWeightRecord}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="content-save" size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>保存記錄</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderWeightHistory = () => {
    const renderHistoryItem = ({ item, index }) => (
      <View style={styles.historyItem}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyDate}>{item.dateDisplay}</Text>
          <View style={styles.historyStats}>
            <Text style={styles.historyWeight}>{item.weight} kg</Text>
            <Text style={styles.historyBMI}>BMI: {item.bmi}</Text>
          </View>
          {index > 0 && (
            <View style={styles.weightChange}>
              {item.weight > weightHistory[index - 1].weight ? (
                <MaterialCommunityIcons name="arrow-up" size={16} color="#E74C3C" />
              ) : item.weight < weightHistory[index - 1].weight ? (
                <MaterialCommunityIcons name="arrow-down" size={16} color="#27AE60" />
              ) : (
                <MaterialCommunityIcons name="minus" size={16} color="#A9A9A9" />
              )}
              <Text style={[
                styles.changeText,
                {
                  color: item.weight > weightHistory[index - 1].weight ? '#E74C3C' :
                         item.weight < weightHistory[index - 1].weight ? '#27AE60' : '#A9A9A9'
                }
              ]}>
                {Math.abs(item.weight - weightHistory[index - 1].weight).toFixed(1)} kg
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              '確認刪除',
              '確定要刪除這筆記錄嗎？',
              [
                { text: '取消', style: 'cancel' },
                { text: '刪除', style: 'destructive', onPress: () => deleteWeightRecord(item.id) }
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
        <Text style={styles.sectionTitle}>歷史記錄</Text>
        {weightHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="scale-bathroom" size={40} color="#A9A9A9" />
            <Text style={styles.emptyText}>還沒有體重記錄</Text>
            <Text style={styles.emptySubtext}>開始記錄您的體重變化</Text>
          </View>
        ) : (
          <FlatList
            data={weightHistory}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    );
  };

  const renderStats = () => {
    if (weightHistory.length < 2) return null;

    const latestWeight = weightHistory[0].weight;
    const oldestWeight = weightHistory[weightHistory.length - 1].weight;
    const totalChange = latestWeight - oldestWeight;
    const avgWeight = weightHistory.reduce((sum, record) => sum + record.weight, 0) / weightHistory.length;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>統計數據</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="chart-line" size={20} color="#00CED1" />
            <Text style={styles.statLabel}>總變化</Text>
            <Text style={[
              styles.statValue,
              { color: totalChange >= 0 ? '#E74C3C' : '#27AE60' }
            ]}>
              {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(1)} kg
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="calculator" size={20} color="#00CED1" />
            <Text style={styles.statLabel}>平均體重</Text>
            <Text style={styles.statValue}>{avgWeight.toFixed(1)} kg</Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="calendar" size={20} color="#00CED1" />
            <Text style={styles.statLabel}>記錄天數</Text>
            <Text style={styles.statValue}>{weightHistory.length} 天</Text>
          </View>
        </View>
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
        {renderWeightForm()}
        {renderStats()}
        {renderWeightHistory()}
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

  // 表單樣式
  formCard: {
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
  bmiSection: {
    backgroundColor: '#1C2526',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  bmiTitle: {
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 10,
  },
  bmiContainer: {
    alignItems: 'center',
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00CED1',
    marginBottom: 5,
  },
  bmiStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#00CED1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // 統計樣式
  statsCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#A9A9A9',
    marginTop: 5,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // 歷史記錄樣式
  historyCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
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
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 4,
  },
  historyStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 15,
  },
  historyBMI: {
    fontSize: 12,
    color: '#00CED1',
  },
  weightChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  changeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
  },
}); 