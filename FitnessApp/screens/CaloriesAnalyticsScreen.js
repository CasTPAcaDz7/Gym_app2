import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart, ProgressChart, LineChart } from 'react-native-chart-kit';
import { useFoodRecords, useExerciseRecords } from '../hooks/useStorage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 計算圖表容器的實際內容寬度
const CHART_CONTAINER_MARGIN = 30; // marginHorizontal: 15 * 2
const CHART_CONTAINER_PADDING = 30; // padding: 15 * 2  
const CHART_CONTENT_WIDTH = screenWidth - CHART_CONTAINER_MARGIN - CHART_CONTAINER_PADDING;

export default function CaloriesAnalyticsScreen({ navigation }) {
  const [currentChart, setCurrentChart] = useState('daily'); // 'daily' or 'monthly'
  const [todayData, setTodayData] = useState(null);
  const [monthlyLineData, setMonthlyLineData] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [exerciseData, setExerciseData] = useState(null); // 新增運動消耗數據
  const [loading, setLoading] = useState(true);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const scrollViewRef = useRef(null);
  const [error, setError] = useState(null);

  // 內置食品數據庫
  const builtInFoods = [
    { id: 1, name: '白米飯 (100g)', calories: 130, carbs: 28, protein: 2.7, fat: 0.3 },
    { id: 2, name: '雞胸肉 (100g)', calories: 165, carbs: 0, protein: 31, fat: 3.6 },
    { id: 3, name: '麵包 (1片)', calories: 80, carbs: 15, protein: 2.5, fat: 1 },
    { id: 4, name: '香蕉 (1根)', calories: 89, carbs: 23, protein: 1.1, fat: 0.3 },
    { id: 5, name: '蘋果 (1個)', calories: 52, carbs: 14, protein: 0.3, fat: 0.2 },
    { id: 6, name: '牛奶 (250ml)', calories: 122, carbs: 12, protein: 8, fat: 5 },
    { id: 7, name: '雞蛋 (1個)', calories: 70, carbs: 0.6, protein: 6, fat: 5 },
    { id: 8, name: '燕麥 (40g)', calories: 154, carbs: 28, protein: 5.4, fat: 2.8 },
  ];

  const { todayFoods, addFoodRecord } = useFoodRecords();
  const { todayExercises, getTodayTotalCaloriesBurned } = useExerciseRecords();

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 確保數據按順序載入
        await Promise.all([
          loadTodayData(),
          loadMonthlyLineData(), 
          loadNutritionData(),
          loadExerciseData() // 新增運動數據載入
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('數據載入失敗:', error);
        setLoading(false);
        
        // 設置默認值以防止崩潰
        setTodayData({
          dailyGoal: 2600,
          consumed: 0,
          remaining: 2600,
          progress: 0,
          percentage: 0
        });
        
        setMonthlyLineData({
          labels: ['1', '5', '10', '15', '20', '25'],
          datasets: [{
            data: [2200, 2300, 2100, 2400, 2250, 2350],
            color: (opacity = 1) => `rgba(0, 206, 209, ${opacity})`,
            strokeWidth: 2,
          }],
          backgroundColor: '#2E3A3B',
        });
        
        setNutritionData([]);
        setExerciseData([]); // 新增默認運動數據
      }
    };
    
    initializeData();
  }, [todayFoods, todayExercises]); // 添加todayExercises依賴

  const loadTodayData = () => {
    const dailyGoal = 2600;
    const consumed = todayFoods?.reduce((sum, food) => sum + (food.calories || 0), 0) || 0;
    const remaining = Math.max(0, dailyGoal - consumed);
    const progress = consumed / dailyGoal;

    setTodayData({
      dailyGoal,
      consumed,
      remaining,
      progress: Math.min(Math.max(progress || 0, 0), 1),
      percentage: Math.round((progress || 0) * 100)
    });
  };

  const loadMonthlyLineData = () => {
    // 生成本月日線圖數據 (包含今天在內的30天數據)
    const days = [];
    const calories = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.getDate().toString());
      
      // 確保生成的數據是有效數字
      const baseCalories = 2200;
      const variation = Math.floor(Math.random() * 600) - 300; // -300 到 +300 的變化
      const dailyCalories = Math.max(1500, baseCalories + variation); // 確保最小值1500
      calories.push(dailyCalories);
    }

    // 確保數據數組長度一致，並確保包含今天
    const validCalories = calories.map(cal => Number.isFinite(cal) ? cal : 2200);
    
    // 創建更好的標籤分佈，確保包含今天
    const labelIndices = [];
    const totalDays = days.length;
    const step = Math.floor(totalDays / 6); // 分成6個區間
    
    for (let i = 0; i < totalDays; i += step) {
      labelIndices.push(i);
    }
    // 確保包含最後一天（今天）
    if (labelIndices[labelIndices.length - 1] !== totalDays - 1) {
      labelIndices.push(totalDays - 1);
    }
    
    const validLabels = labelIndices.map(index => days[index]).slice(0, 6);

    setMonthlyLineData({
      labels: validLabels,
      datasets: [
        {
          data: validCalories,
          color: (opacity = 1) => `rgba(0, 206, 209, ${opacity})`,
          strokeWidth: 2,
        }
      ]
    });
  };

  const loadNutritionData = () => {
    const totalCarbs = todayFoods.reduce((sum, food) => sum + (food.carbs || 0), 0);
    const totalProtein = todayFoods.reduce((sum, food) => sum + (food.protein || 0), 0);
    const totalFat = todayFoods.reduce((sum, food) => sum + (food.fat || 0), 0);
    const total = totalCarbs + totalProtein + totalFat;

    if (total === 0 || !Number.isFinite(total)) {
      setNutritionData([]);
      setLoading(false);
      return;
    }

    // 確保所有數值都是有效數字
    const validCarbs = Number.isFinite(totalCarbs) ? totalCarbs : 0;
    const validProtein = Number.isFinite(totalProtein) ? totalProtein : 0;
    const validFat = Number.isFinite(totalFat) ? totalFat : 0;
    const validTotal = validCarbs + validProtein + validFat;

    if (validTotal === 0) {
      setNutritionData([]);
      setLoading(false);
      return;
    }

    setNutritionData([
      {
        name: '碳水化合物',
        amount: validCarbs.toFixed(1),
        color: '#FF6B6B',
        legendFontColor: '#ffffff',
        legendFontSize: 12,
        percentage: ((validCarbs / validTotal) * 100).toFixed(1)
      },
      {
        name: '蛋白質',
        amount: validProtein.toFixed(1),
        color: '#4ECDC4',
        legendFontColor: '#ffffff',
        legendFontSize: 12,
        percentage: ((validProtein / validTotal) * 100).toFixed(1)
      },
      {
        name: '脂肪',
        amount: validFat.toFixed(1),
        color: '#45B7D1',
        legendFontColor: '#ffffff',
        legendFontSize: 12,
        percentage: ((validFat / validTotal) * 100).toFixed(1)
      }
    ]);
    setLoading(false);
  };

  const loadExerciseData = () => {
    // 運動類型顏色映射
    const exerciseColors = {
      '跑步': '#E74C3C',
      '健身房訓練': '#2E86AB', 
      '騎車': '#F39C12',
      '游泳': '#3498DB',
      '瑜伽': '#9B59B6',
      '走路': '#27AE60',
      '舞蹈': '#E91E63',
      '登山': '#795548'
    };

    if (!todayExercises || todayExercises.length === 0) {
      setExerciseData([]);
      return;
    }

    // 按運動類型分組並計算總消耗
    const exerciseGroups = {};
    let totalBurned = 0;

    todayExercises.forEach(exercise => {
      const type = exercise.type || '其他';
      const burned = exercise.caloriesBurned || 0;
      
      if (!exerciseGroups[type]) {
        exerciseGroups[type] = {
          name: type,
          amount: 0,
          color: exerciseColors[type] || '#95A5A6'
        };
      }
      
      exerciseGroups[type].amount += burned;
      totalBurned += burned;
    });

    if (totalBurned === 0) {
      setExerciseData([]);
      return;
    }

    // 轉換為餅圖數據格式
    const chartData = Object.values(exerciseGroups).map(group => ({
      name: group.name,
      amount: group.amount,
      color: group.color,
      legendFontColor: '#ffffff',
      legendFontSize: 12,
      percentage: ((group.amount / totalBurned) * 100).toFixed(1)
    }));

    setExerciseData(chartData);
  };

  // 處理滑動切換圖表
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newChart = offsetX > screenWidth / 2 ? 'monthly' : 'daily';
    if (newChart !== currentChart) {
      setCurrentChart(newChart);
    }
  };

  // 添加食物記錄
  const handleAddFood = async (food) => {
    try {
      const newRecord = {
        id: Date.now().toString(),
        name: food.name,
        calories: food.calories,
        carbs: food.carbs,
        protein: food.protein,
        fat: food.fat,
        date: new Date().toISOString(),
        amount: 100
      };
      
      await addFoodRecord(newRecord);
      setShowFoodModal(false);
      Alert.alert('成功', `已添加 ${food.name}`);
    } catch (error) {
      console.error('添加食物失敗:', error);
      Alert.alert('錯誤', '添加食物失敗');
    }
  };

  // 掃描條碼功能
  const handleBarcodeScan = () => {
    Alert.alert(
      '條碼掃描',
      '此功能正在開發中，將連接食品數據庫獲取營養資訊',
      [
        { text: '取消', style: 'cancel' },
        { text: '確定', style: 'default' }
      ]
    );
  };

  // 拍照識別功能
  const handlePhotoRecognition = () => {
    navigation.navigate('Diet', {
      screen: 'FoodPhoto'
    });
  };

  // 導航到用餐記錄數據庫
  const handleViewFoodDatabase = () => {
    navigation.navigate('FoodDatabase');
  };

  // 渲染卡路里圖表區域
  const renderCalorieCharts = () => (
    <View style={styles.chartContainer}>
      {/* 記錄按鈕 - 放在整個容器右上角，只在月線圖時顯示 */}
      {currentChart === 'monthly' && (
        <TouchableOpacity 
          style={styles.containerDatabaseButton}
          onPress={handleViewFoodDatabase}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="database" size={16} color="#ffffff" />
          <Text style={styles.containerDatabaseButtonText}>記錄</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleContainer}>
          <Text style={styles.chartTitle}>
            {currentChart === 'daily' ? '今日卡路里攝取' : '本月卡路里趨勢'}
          </Text>
        </View>
        <Text style={styles.chartSubtitle}>左右滑動切換視圖</Text>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.chartScrollView}
        decelerationRate="fast"
        bounces={false}
        scrollsToTop={false}
      >
        {/* 今日卡路里圖表 */}
        <View style={styles.chartPage}>
          <View style={styles.todayChartContainer}>
            {/* 左側：卡路里攝取進度圖 */}
            <View style={styles.calorieIntakeSection}>
              <Text style={styles.sectionSubtitle}>攝取進度</Text>
              <View style={styles.progressChartWrapper}>
                <ProgressChart
                  data={{
                    data: [Math.max(0, Math.min(1, todayData?.progress || 0))] // 確保progress在0-1之間，無數據時顯示0
                  }}
                  width={screenWidth * 0.45}
                  height={150}
                  strokeWidth={10}
                  radius={55}
                  chartConfig={{
                    backgroundColor: '#2E3A3B',
                    backgroundGradientFrom: '#2E3A3B',
                    backgroundGradientTo: '#2E3A3B',
                    color: (opacity = 1) => `rgba(0, 206, 209, ${opacity})`,
                    fillShadowGradient: '#00CED1',
                    fillShadowGradientOpacity: 0.1,
                  }}
                  hideLegend={true}
                  style={styles.progressChart}
                />
                <View style={styles.progressOverlay}>
                  <Text style={styles.progressText}>{todayData?.percentage || 0}%</Text>
                  <Text style={styles.progressSubtext}>已攝取</Text>
                  <Text style={styles.calorieText}>{todayData?.consumed || 0}</Text>
                  <Text style={styles.calorieSubtext}>/ {todayData?.dailyGoal || 2600}</Text>
                </View>
              </View>
            </View>

            {/* 右側：運動消耗餅圖 */}
            <View style={styles.caloriesBurnedSection}>
              <Text style={styles.sectionSubtitle}>運動消耗</Text>
              {exerciseData && exerciseData.length > 0 ? (
                <View style={styles.exercisePieChartContainer}>
                  <PieChart
                    data={exerciseData.map(item => ({
                      ...item,
                      amount: parseFloat(item.amount) || 0
                    }))}
                    width={screenWidth * 0.45}
                    height={150}
                    chartConfig={{
                      backgroundColor: '#2E3A3B',
                      backgroundGradientFrom: '#2E3A3B',
                      backgroundGradientTo: '#2E3A3B',
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    }}
                    accessor={'amount'}
                    backgroundColor={'#2E3A3B'}
                    paddingLeft={'0'}
                    center={[0, 0]}
                    hasLegend={false}
                    absolute={true}
                  />
                  <View style={styles.exerciseStats}>
                    <Text style={styles.totalBurnedText}>
                      總消耗: {getTodayTotalCaloriesBurned()} 卡
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noExerciseDataImproved}>
                  <View style={styles.exerciseEmptyChartWrapper}>
                    <View style={styles.exerciseEmptyChart}>
                      <MaterialCommunityIcons name="dumbbell" size={40} color="#4A5657" />
                    </View>
                    <View style={styles.exerciseEmptyOverlay}>
                      <Text style={styles.exerciseEmptyText}>0卡</Text>
                      <Text style={styles.exerciseEmptySubtext}>總消耗</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 本月日線圖 */}
        <View style={styles.chartPage}>
          {monthlyLineData && monthlyLineData.datasets && monthlyLineData.datasets[0] && 
           monthlyLineData.datasets[0].data && monthlyLineData.datasets[0].data.length > 0 && (
            <View style={styles.monthlyChartContainer}>
              {/* 圖表居中顯示 */}
              <View style={styles.chartWrapper}>
                <LineChart
                  data={monthlyLineData}
                  width={screenWidth * 0.9}
                  height={180}
                  yAxisLabel=""
                  yAxisSuffix=""
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundColor: '#2E3A3B',
                    backgroundGradientFrom: '#2E3A3B',
                    backgroundGradientTo: '#2E3A3B',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 206, 209, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: '#00CED1'
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: '#4A5657',
                      strokeWidth: 1,
                    },
                    fillShadowGradient: '#00CED1',
                    fillShadowGradientOpacity: 0.1,
                    propsForLabels: {
                      fontSize: 12,
                      fontWeight: 'normal',
                    },
                  }}
                  bezier
                  style={styles.lineChart}
                  withInnerLines={false}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  fromZero={false}
                  segments={4}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* 圖表指示器 */}
      <View style={styles.indicator}>
        <View style={[styles.dot, currentChart === 'daily' && styles.activeDot]} />
        <View style={[styles.dot, currentChart === 'monthly' && styles.activeDot]} />
      </View>
    </View>
  );

  // 渲染功能按鈕
  const renderActionButtons = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>記錄用餐</Text>
      <View style={styles.buttonGrid}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowFoodModal(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="food-apple" size={32} color="#00CED1" />
          <Text style={styles.buttonText}>選擇食品</Text>
          <Text style={styles.buttonSubtext}>內置食品庫</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleBarcodeScan}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="barcode-scan" size={32} color="#FF6B6B" />
          <Text style={styles.buttonText}>掃描條碼</Text>
          <Text style={styles.buttonSubtext}>食品數據庫</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handlePhotoRecognition}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="camera" size={32} color="#4ECDC4" />
          <Text style={styles.buttonText}>拍照識別</Text>
          <Text style={styles.buttonSubtext}>AI 自動識別</Text>
        </TouchableOpacity>
      </View>
      
      {/* 營養素分布 */}
      <View style={styles.nutritionSection}>
        <Text style={styles.nutritionTitle}>今日營養素分布</Text>
        {nutritionData && nutritionData.length > 0 ? (
          <View style={styles.nutritionCirclesContainer}>
            {/* 碳水化合物 */}
            <View style={styles.nutritionCircle}>
              <Text style={styles.nutritionCircleTitle}>Carbohydrates</Text>
              <View style={styles.progressCircleWrapper}>
                <ProgressChart
                  data={{
                    data: [Math.min(parseFloat(nutritionData[0]?.amount || 0) / 163, 1)]
                  }}
                  width={100}
                  height={100}
                  strokeWidth={8}
                  radius={40}
                  chartConfig={{
                    backgroundColor: '#2E3A3B',
                    backgroundGradientFrom: '#2E3A3B',
                    backgroundGradientTo: '#2E3A3B',
                    color: (opacity = 1) => `rgba(0, 206, 209, ${opacity})`, // 青綠色
                    fillShadowGradient: '#4CCDC4',
                    fillShadowGradientOpacity: 0.1,
                  }}
                  hideLegend={true}
                  style={styles.progressCircle}
                />
                <View style={styles.circleOverlay}>
                  <Text style={styles.circleValue}>{parseFloat(nutritionData[0]?.amount || 0).toFixed(0)}</Text>
                  <Text style={styles.circleTarget}>/163g</Text>
                </View>
              </View>
              <Text style={styles.nutritionRemaining}>
                {Math.max(0, 163 - parseFloat(nutritionData[0]?.amount || 0)).toFixed(0)}g left
              </Text>
            </View>

            {/* 脂肪 */}
            <View style={styles.nutritionCircle}>
              <Text style={styles.nutritionCircleTitle}>Fat</Text>
              <View style={styles.progressCircleWrapper}>
                <ProgressChart
                  data={{
                    data: [Math.min(parseFloat(nutritionData[2]?.amount || 0) / 43, 1)]
                  }}
                  width={100}
                  height={100}
                  strokeWidth={8}
                  radius={40}
                  chartConfig={{
                    backgroundColor: '#2E3A3B',
                    backgroundGradientFrom: '#2E3A3B',
                    backgroundGradientTo: '#2E3A3B',
                    color: (opacity = 1) => `rgba(142, 68, 173, ${opacity})`, // 紫色
                    fillShadowGradient: '#9B59B6',
                    fillShadowGradientOpacity: 0.1,
                  }}
                  hideLegend={true}
                  style={styles.progressCircle}
                />
                <View style={styles.circleOverlay}>
                  <Text style={styles.circleValue}>{parseFloat(nutritionData[2]?.amount || 0).toFixed(0)}</Text>
                  <Text style={styles.circleTarget}>/43g</Text>
                </View>
              </View>
              <Text style={styles.nutritionRemaining}>
                {Math.max(0, 43 - parseFloat(nutritionData[2]?.amount || 0)).toFixed(0)}g left
              </Text>
            </View>

            {/* 蛋白質 */}
            <View style={styles.nutritionCircle}>
              <Text style={styles.nutritionCircleTitle}>Protein</Text>
              <View style={styles.progressCircleWrapper}>
                <ProgressChart
                  data={{
                    data: [Math.min(parseFloat(nutritionData[1]?.amount || 0) / 65, 1)]
                  }}
                  width={100}
                  height={100}
                  strokeWidth={8}
                  radius={40}
                  chartConfig={{
                    backgroundColor: '#2E3A3B',
                    backgroundGradientFrom: '#2E3A3B',
                    backgroundGradientTo: '#2E3A3B',
                    color: (opacity = 1) => `rgba(230, 126, 34, ${opacity})`, // 橙色
                    fillShadowGradient: '#F1C40F',
                    fillShadowGradientOpacity: 0.1,
                  }}
                  hideLegend={true}
                  style={styles.progressCircle}
                />
                <View style={styles.circleOverlay}>
                  <Text style={styles.circleValue}>{parseFloat(nutritionData[1]?.amount || 0).toFixed(0)}</Text>
                  <Text style={styles.circleTarget}>/65g</Text>
                </View>
              </View>
              <Text style={styles.nutritionRemaining}>
                {Math.max(0, 65 - parseFloat(nutritionData[1]?.amount || 0)).toFixed(0)}g left
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="chart-pie" size={40} color="#A9A9A9" />
            <Text style={styles.noDataText}>尚未記錄任何食物</Text>
          </View>
        )}
      </View>
    </View>
  );

  // 渲染食品選擇模態框
  const renderFoodModal = () => (
    <Modal
      visible={showFoodModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFoodModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFoodModal(false)}>
            <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>選擇食品</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <FlatList
          data={builtInFoods}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.foodItem}
              onPress={() => handleAddFood(item)}
            >
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                <Text style={styles.foodNutrition}>
                  碳水: {item.carbs}g | 蛋白質: {item.protein}g | 脂肪: {item.fat}g
                </Text>
              </View>
              <MaterialCommunityIcons name="plus" size={24} color="#00CED1" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.foodList}
        />
      </SafeAreaView>
    </Modal>
  );

  if (loading && !todayData && !monthlyLineData) {
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
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>卡路里分析</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCalorieCharts()}
        {renderActionButtons()}
      </ScrollView>

      {renderFoodModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1C2526',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
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
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    backgroundColor: '#1C2526',
  },

  // 圖表容器樣式 - 佔30%高度
  chartContainer: {
    height: screenHeight * 0.3,
    backgroundColor: '#2E3A3B',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 16,
    padding: 15,
  },
  chartHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#A9A9A9',
  },
  chartScrollView: {
    flex: 1,
  },
  chartPage: {
    width: CHART_CONTENT_WIDTH, // 使用計算出的精確內容寬度
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  
  // 今日圖表樣式
  todayChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    paddingHorizontal: 10,
    height: '100%',
  },
  calorieIntakeSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  caloriesBurnedSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressChartWrapper: {
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'center',
    marginTop: 10,
  },
  progressChart: {
    marginVertical: 5,
    borderRadius: 16,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00CED1',
  },
  progressSubtext: {
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 5,
  },
  calorieText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  calorieSubtext: {
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 5,
  },

  // 本月日線圖樣式
  monthlyChartContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 5,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 5,
    marginTop: -10,
    marginLeft: 0, // 移除向左偏移，讓圖表居中（從-20調整到0）
  },
  lineChart: {
    marginVertical: 5,
    borderRadius: 16,
    marginLeft: 0, // 移除向左偏移，讓圖表居中（從-10調整到0）
  },
  headerDatabaseButton: {
    backgroundColor: '#3A4B4C',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerDatabaseButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },

  // 圖表指示器
  indicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A5657',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#00CED1',
  },

  // 功能按鈕區域 - 佔剩餘空間
  actionsContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2E3A3B',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    minHeight: 100,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonSubtext: {
    fontSize: 11,
    color: '#A9A9A9',
    marginTop: 4,
    textAlign: 'center',
  },

  // 營養素分布樣式
  nutritionSection: {
    flex: 1,
    backgroundColor: '#2E3A3B',
    borderRadius: 16,
    padding: 20,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  nutritionCirclesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  nutritionCircle: {
    alignItems: 'center',
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 10,
  },
  nutritionCircleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  progressCircleWrapper: {
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'center',
    marginTop: 10,
  },
  progressCircle: {
    marginVertical: 5,
    borderRadius: 16,
  },
  circleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  circleValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  circleTarget: {
    fontSize: 12,
    color: '#A9A9A9',
  },
  nutritionRemaining: {
    fontSize: 14,
    color: '#A9A9A9',
    marginTop: 5,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#A9A9A9',
    marginTop: 10,
    textAlign: 'center',
  },

  // Modal 樣式
  modalContainer: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  foodList: {
    padding: 20,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E3A3B',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  foodCalories: {
    fontSize: 14,
    color: '#00CED1',
    marginBottom: 3,
  },
  foodNutrition: {
    fontSize: 12,
    color: '#A9A9A9',
  },

  // 記錄按鈕樣式
  containerDatabaseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#3A4B4C',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  containerDatabaseButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },

  // 運動消耗圖表樣式
  exercisePieChartContainer: {
    alignItems: 'center',
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 5,
    marginTop: 10,
    justifyContent: 'center',
  },
  exerciseStats: {
    marginTop: 10,
    alignItems: 'center',
  },
  totalBurnedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  noExerciseDataImproved: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  exerciseEmptyChartWrapper: {
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'center',
    width: screenWidth * 0.45,
    height: 150,
  },
  exerciseEmptyChart: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#2E3A3B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 10,
    borderColor: '#4A5657',
  },
  exerciseEmptyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseEmptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A9A9A9',
  },
  exerciseEmptySubtext: {
    fontSize: 12,
    color: '#A9A9A9',
    marginTop: 2,
  },
}); 