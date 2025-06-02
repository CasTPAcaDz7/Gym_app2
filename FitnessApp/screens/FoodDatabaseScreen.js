import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFoodRecords } from '../hooks/useStorage';

const { width: screenWidth } = Dimensions.get('window');

export default function FoodDatabaseScreen({ navigation }) {
  const { allFoodRecords, deleteFoodRecord } = useFoodRecords();
  const [groupedRecords, setGroupedRecords] = useState({});
  const [totalStats, setTotalStats] = useState({});

  useEffect(() => {
    groupRecordsByDate();
    calculateTotalStats();
  }, [allFoodRecords]);

  // 按日期分組記錄
  const groupRecordsByDate = () => {
    const grouped = {};
    allFoodRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString('zh-TW');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });
    setGroupedRecords(grouped);
  };

  // 計算總統計
  const calculateTotalStats = () => {
    const total = allFoodRecords.reduce(
      (acc, record) => ({
        calories: acc.calories + (record.calories || 0),
        carbs: acc.carbs + (record.carbs || 0),
        protein: acc.protein + (record.protein || 0),
        fat: acc.fat + (record.fat || 0),
        count: acc.count + 1,
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0, count: 0 }
    );
    setTotalStats(total);
  };

  // 計算單日統計
  const getDayStats = (records) => {
    return records.reduce(
      (acc, record) => ({
        calories: acc.calories + (record.calories || 0),
        carbs: acc.carbs + (record.carbs || 0),
        protein: acc.protein + (record.protein || 0),
        fat: acc.fat + (record.fat || 0),
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
  };

  // 刪除記錄確認
  const confirmDelete = (recordId, foodName) => {
    Alert.alert(
      '刪除記錄',
      `確定要刪除 "${foodName}" 嗎？`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '刪除', 
          style: 'destructive',
          onPress: () => handleDelete(recordId)
        }
      ]
    );
  };

  // 刪除記錄
  const handleDelete = async (recordId) => {
    try {
      await deleteFoodRecord(recordId);
      Alert.alert('成功', '記錄已刪除');
    } catch (error) {
      console.error('刪除失敗:', error);
      Alert.alert('錯誤', '刪除記錄失敗');
    }
  };

  // 渲染表格標題
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.foodNameCell]}>食品名稱</Text>
      <Text style={[styles.headerCell, styles.calorieCell]}>卡路里</Text>
      <Text style={[styles.headerCell, styles.nutrientCell]}>碳水</Text>
      <Text style={[styles.headerCell, styles.nutrientCell]}>蛋白質</Text>
      <Text style={[styles.headerCell, styles.nutrientCell]}>脂肪</Text>
      <Text style={[styles.headerCell, styles.actionCell]}>操作</Text>
    </View>
  );

  // 渲染食品記錄行
  const renderFoodRecord = (record) => (
    <View key={record.id} style={styles.tableRow}>
      <Text style={[styles.cell, styles.foodNameCell]} numberOfLines={2}>
        {record.name}
      </Text>
      <Text style={[styles.cell, styles.calorieCell]}>
        {record.calories}
      </Text>
      <Text style={[styles.cell, styles.nutrientCell]}>
        {record.carbs?.toFixed(1) || '0.0'}g
      </Text>
      <Text style={[styles.cell, styles.nutrientCell]}>
        {record.protein?.toFixed(1) || '0.0'}g
      </Text>
      <Text style={[styles.cell, styles.nutrientCell]}>
        {record.fat?.toFixed(1) || '0.0'}g
      </Text>
      <TouchableOpacity
        style={[styles.cell, styles.actionCell]}
        onPress={() => confirmDelete(record.id, record.name)}
      >
        <MaterialCommunityIcons name="delete" size={18} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  // 渲染日期統計行
  const renderDayStats = (stats) => (
    <View style={styles.statsRow}>
      <Text style={[styles.statsCell, styles.foodNameCell]}>日總計</Text>
      <Text style={[styles.statsCell, styles.calorieCell]}>
        {stats.calories}
      </Text>
      <Text style={[styles.statsCell, styles.nutrientCell]}>
        {stats.carbs.toFixed(1)}g
      </Text>
      <Text style={[styles.statsCell, styles.nutrientCell]}>
        {stats.protein.toFixed(1)}g
      </Text>
      <Text style={[styles.statsCell, styles.nutrientCell]}>
        {stats.fat.toFixed(1)}g
      </Text>
      <View style={[styles.statsCell, styles.actionCell]} />
    </View>
  );

  // 渲染日期分組
  const renderDateGroup = ({ item: date }) => {
    const records = groupedRecords[date];
    const dayStats = getDayStats(records);

    return (
      <View style={styles.dateGroup}>
        <View style={styles.dateHeader}>
          <MaterialCommunityIcons name="calendar" size={20} color="#00CED1" />
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.recordCount}>({records.length} 項記錄)</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={Platform.OS === 'web'}>
          <View style={styles.table}>
            {renderTableHeader()}
            {records.map(record => renderFoodRecord(record))}
            {renderDayStats(dayStats)}
          </View>
        </ScrollView>
      </View>
    );
  };

  // 渲染總統計卡片
  const renderTotalStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>總計統計</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
          <Text style={styles.statValue}>{totalStats.calories}</Text>
          <Text style={styles.statLabel}>總卡路里</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="food" size={24} color="#4ECDC4" />
          <Text style={styles.statValue}>{totalStats.count}</Text>
          <Text style={styles.statLabel}>食品數量</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="nutrition" size={24} color="#45B7D1" />
          <Text style={styles.statValue}>{totalStats.protein.toFixed(1)}g</Text>
          <Text style={styles.statLabel}>總蛋白質</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="grain" size={24} color="#FFA726" />
          <Text style={styles.statValue}>{totalStats.carbs.toFixed(1)}g</Text>
          <Text style={styles.statLabel}>總碳水</Text>
        </View>
      </View>
    </View>
  );

  const datesList = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>用餐記錄數據庫</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => Alert.alert('匯出功能', '此功能正在開發中')}
        >
          <MaterialCommunityIcons name="export" size={24} color="#00CED1" />
        </TouchableOpacity>
      </View>

      {allFoodRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="database-off" size={80} color="#A9A9A9" />
          <Text style={styles.emptyText}>尚無用餐記錄</Text>
          <Text style={styles.emptySubtext}>開始記錄您的飲食來查看數據</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CaloriesAnalytics')}
          >
            <Text style={styles.addButtonText}>開始記錄</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          {renderTotalStats()}
          
          <FlatList
            data={datesList}
            keyExtractor={(item) => item}
            renderItem={renderDateGroup}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  exportButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  
  // 統計卡片樣式
  statsContainer: {
    backgroundColor: '#2E3A3B',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1C2526',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#A9A9A9',
  },

  // 列表樣式
  listContainer: {
    padding: 15,
  },
  dateGroup: {
    backgroundColor: '#2E3A3B',
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3A4B4C',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
  },
  recordCount: {
    fontSize: 12,
    color: '#A9A9A9',
    marginLeft: 'auto',
  },

  // 表格樣式
  table: {
    minWidth: screenWidth - 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1C2526',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00CED1',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#2E3A3B',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4B4C',
  },
  cell: {
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#3A4B4C',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statsCell: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00CED1',
    textAlign: 'center',
  },

  // 列寬度
  foodNameCell: {
    width: 120,
    textAlign: 'left',
    paddingRight: 10,
  },
  calorieCell: {
    width: 60,
  },
  nutrientCell: {
    width: 65,
  },
  actionCell: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 空狀態樣式
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A9A9A9',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#00CED1',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
}); 