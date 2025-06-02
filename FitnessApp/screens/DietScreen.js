import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFoodRecords, useExerciseRecords, useStats } from '../hooks/useStorage';

const { width: screenWidth } = Dimensions.get('window');

export default function DietScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [dailyGoal] = useState(2600); // 目標卡路里
  
  // 使用新的Hook系統獲取數據
  const { 
    todayFoods, 
    getTodayTotalCalories, 
    deleteFoodRecord, 
    loading: foodLoading 
  } = useFoodRecords();
  
  const { 
    todayExercises, 
    getTodayTotalCaloriesBurned 
  } = useExerciseRecords();
  
  const { todayOverview, refreshStats } = useStats();

  // 營養素目標
  const carbsGoal = 163; // g
  const fatGoal = 43; // g
  const proteinGoal = 65; // g

  useEffect(() => {
    // 當頁面聚焦時刷新數據
    const unsubscribe = navigation.addListener('focus', () => {
      refreshStats();
    });

    return unsubscribe;
  }, [navigation, refreshStats]);

  useEffect(() => {
    // 初始載入完成
    setLoading(false);
  }, []);

  // 計算營養素總量
  const calculateNutritionTotals = () => {
    let totalCarbs = 0;
    let totalFat = 0;
    let totalProtein = 0;

    todayFoods.forEach(food => {
      if (food && typeof food === 'object') {
        totalCarbs += Number(food.carbs) || 0;
        totalFat += Number(food.fat) || 0;
        totalProtein += Number(food.protein) || 0;
      }
    });

    return {
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      protein: Math.round(totalProtein * 10) / 10
    };
  };

  const renderCalorieTracker = () => {
    const consumedCalories = getTodayTotalCalories();
    const burnedCalories = getTodayTotalCaloriesBurned();
    const remainingCalories = dailyGoal - consumedCalories; // 不包括運動消耗

    return (
      <View style={styles.calorieCard}>
        <Text style={styles.calorieTitle}>卡路里</Text>
        <Text style={styles.calorieSubtitle}>剩餘 = 目標 - 食品攝取</Text>
        
        <View style={styles.calorieContainer}>
          <View style={styles.calorieCircle}>
            <Text style={styles.remainingCalories}>{Math.max(0, remainingCalories)}</Text>
            <Text style={styles.remainingText}>剩餘</Text>
          </View>
          
          <View style={styles.calorieStats}>
            <View style={styles.calorieStat}>
              <MaterialCommunityIcons name="flag" size={20} color="#00CED1" />
              <Text style={styles.calorieLabel}>基本目標</Text>
              <Text style={styles.calorieValue}>{dailyGoal}</Text>
            </View>
            
            <View style={styles.calorieStat}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#00CED1" />
              <Text style={styles.calorieLabel}>食品攝取</Text>
              <Text style={styles.calorieValue}>{consumedCalories}</Text>
            </View>
            
            <View style={styles.calorieStat}>
              <MaterialCommunityIcons name="heart-pulse" size={20} color="#FF6B6B" />
              <Text style={styles.calorieLabel}>運動消耗</Text>
              <Text style={[styles.calorieValue, { color: '#FF6B6B' }]}>{burnedCalories}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderNutritionCircles = () => {
    const nutrition = calculateNutritionTotals();
    const carbsPercentage = Math.min((nutrition.carbs / carbsGoal) * 100, 100);
    const fatPercentage = Math.min((nutrition.fat / fatGoal) * 100, 100);
    const proteinPercentage = Math.min((nutrition.protein / proteinGoal) * 100, 100);

    return (
      <View style={styles.nutritionCard}>
        <View style={styles.nutritionContainer}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionTitle}>Carbohydrates</Text>
            <View style={styles.nutritionCircle}>
              <Text style={styles.nutritionValue}>{nutrition.carbs}</Text>
              <Text style={styles.nutritionUnit}>/{carbsGoal}g</Text>
            </View>
            <Text style={styles.nutritionRemaining}>{Math.max(0, carbsGoal - nutrition.carbs)}g left</Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionTitle}>Fat</Text>
            <View style={styles.nutritionCircle}>
              <Text style={styles.nutritionValue}>{nutrition.fat}</Text>
              <Text style={styles.nutritionUnit}>/{fatGoal}g</Text>
            </View>
            <Text style={styles.nutritionRemaining}>{Math.max(0, fatGoal - nutrition.fat)}g left</Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionTitle}>Protein</Text>
            <View style={styles.nutritionCircle}>
              <Text style={styles.nutritionValue}>{nutrition.protein}</Text>
              <Text style={styles.nutritionUnit}>/{proteinGoal}g</Text>
            </View>
            <Text style={styles.nutritionRemaining}>{Math.max(0, proteinGoal - nutrition.protein)}g left</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderActionButtons = () => {
    const buttons = [
      {
        title: '記錄食品',
        icon: 'magnify',
        color: '#4A90E2',
        onPress: () => navigation.navigate('AddFood'),
      },
      {
        title: '拍照辨識',
        icon: 'camera',
        color: '#FF6B6B',
        onPress: () => navigation.navigate('FoodPhoto'),
      },
      {
        title: '條碼掃描',
        icon: 'barcode-scan',
        color: '#E74C3C',
        onPress: () => alert('條碼掃描功能開發中'),
      },
      {
        title: '體重記錄',
        icon: 'scale-bathroom',
        color: '#27AE60',
        onPress: () => navigation.navigate('WeightRecord'),
      },
      {
        title: '運動記錄',
        icon: 'heart-pulse',
        color: '#F39C12',
        onPress: () => navigation.navigate('ExerciseRecord'),
      },
    ];

    return (
      <View style={styles.actionButtonsContainer}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, { backgroundColor: button.color }]}
            onPress={button.onPress}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name={button.icon} 
              size={30} 
              color="#ffffff" 
            />
            <Text style={styles.actionButtonText}>{button.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderFoodItem = ({ item }) => (
    <View style={styles.foodItem}>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodDetails}>
          {item.amount}g • {item.calories || item.totalCalories}卡 • 
          碳水{item.carbs}g • 脂肪{item.fat}g • 蛋白質{item.protein}g
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteFoodButton}
        onPress={() => handleDeleteFood(item)}
      >
        <MaterialCommunityIcons name="delete" size={20} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  // 處理刪除食物記錄
  const handleDeleteFood = (food) => {
    Alert.alert(
      '確認刪除',
      `確定要刪除 ${food.name} 嗎？`,
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteFoodRecord(food.id);
              if (!success) {
                Alert.alert('錯誤', '刪除失敗，請重試');
              }
            } catch (error) {
              console.error('刪除食物記錄失敗:', error);
              Alert.alert('錯誤', '刪除失敗，請重試');
            }
          }
        }
      ]
    );
  };

  const renderTodayFoods = () => (
    <View style={styles.todayFoodsCard}>
      <Text style={styles.sectionTitle}>今日飲食記錄</Text>
      {todayFoods.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="food-apple" size={40} color="#A9A9A9" />
          <Text style={styles.emptyText}>還沒有記錄任何食物</Text>
          <Text style={styles.emptySubtext}>點擊上方按鈕開始記錄</Text>
        </View>
      ) : (
        <FlatList
          data={todayFoods}
          renderItem={renderFoodItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00CED1" />
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
        {renderCalorieTracker()}
        {renderNutritionCircles()}
        {renderActionButtons()}
        {renderTodayFoods()}
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
    marginTop: 10,
    fontSize: 16,
  },

  // 卡路里追蹤樣式
  calorieCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  calorieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  calorieSubtitle: {
    fontSize: 12,
    color: '#A9A9A9',
    textAlign: 'center',
    marginBottom: 15,
  },
  calorieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1C2526',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  remainingCalories: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00CED1',
  },
  remainingText: {
    fontSize: 12,
    color: '#A9A9A9',
  },
  calorieStats: {
    flex: 1,
  },
  calorieStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  calorieLabel: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 10,
    flex: 1,
  },
  calorieValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00CED1',
  },

  // 營養素圓形圖樣式
  nutritionCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionTitle: {
    fontSize: 12,
    color: '#00CED1',
    marginBottom: 10,
    textAlign: 'center',
  },
  nutritionCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1C2526',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  nutritionUnit: {
    fontSize: 10,
    color: '#A9A9A9',
  },
  nutritionRemaining: {
    fontSize: 10,
    color: '#A9A9A9',
  },

  // 操作按鈕樣式
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  actionButton: {
    width: (screenWidth - 45) / 2,
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },

  // 今日飲食記錄樣式
  todayFoodsCard: {
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
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4A5657',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  foodDetails: {
    fontSize: 12,
    color: '#A9A9A9',
    marginTop: 2,
  },
  deleteFoodButton: {
    padding: 8,
  },
}); 