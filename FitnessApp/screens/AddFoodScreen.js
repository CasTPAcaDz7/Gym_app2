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
  Modal,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFoodRecords } from '../hooks/useStorage';

// 常見食物數據庫
const COMMON_FOODS = [
  { id: '1', name: '白米飯', calories: 130, carbs: 28, fat: 0.3, protein: 2.7 },
  { id: '2', name: '糙米飯', calories: 112, carbs: 22, fat: 0.9, protein: 2.6 },
  { id: '3', name: '白麵條', calories: 158, carbs: 31, fat: 1.1, protein: 5 },
  { id: '4', name: '雞胸肉', calories: 165, carbs: 0, fat: 3.6, protein: 31 },
  { id: '5', name: '牛肉', calories: 250, carbs: 0, fat: 15, protein: 26 },
  { id: '6', name: '豬肉', calories: 242, carbs: 0, fat: 14, protein: 27 },
  { id: '7', name: '鮭魚', calories: 208, carbs: 0, fat: 12, protein: 22 },
  { id: '8', name: '雞蛋', calories: 155, carbs: 1.1, fat: 11, protein: 13 },
  { id: '9', name: '牛奶', calories: 42, carbs: 5, fat: 1, protein: 3.4 },
  { id: '10', name: '香蕉', calories: 89, carbs: 23, fat: 0.3, protein: 1.1 },
  { id: '11', name: '蘋果', calories: 52, carbs: 14, fat: 0.2, protein: 0.3 },
  { id: '12', name: '橘子', calories: 47, carbs: 12, fat: 0.1, protein: 0.9 },
  { id: '13', name: '花椰菜', calories: 25, carbs: 5, fat: 0.3, protein: 3 },
  { id: '14', name: '菠菜', calories: 23, carbs: 3.6, fat: 0.4, protein: 2.9 },
  { id: '15', name: '胡蘿蔔', calories: 41, carbs: 10, fat: 0.2, protein: 0.9 },
  { id: '16', name: '番茄', calories: 18, carbs: 3.9, fat: 0.2, protein: 0.9 },
  { id: '17', name: '馬鈴薯', calories: 77, carbs: 17, fat: 0.1, protein: 2 },
  { id: '18', name: '地瓜', calories: 86, carbs: 20, fat: 0.1, protein: 1.6 },
  { id: '19', name: '豆腐', calories: 76, carbs: 1.9, fat: 4.8, protein: 8.1 },
  { id: '20', name: '酪梨', calories: 160, carbs: 9, fat: 15, protein: 2 },
  { id: '21', name: '杏仁', calories: 579, carbs: 22, fat: 50, protein: 21 },
  { id: '22', name: '核桃', calories: 654, carbs: 14, fat: 65, protein: 15 },
  { id: '23', name: '燕麥', calories: 389, carbs: 66, fat: 7, protein: 17 },
  { id: '24', name: '優格', calories: 59, carbs: 3.6, fat: 3.3, protein: 10 },
];

export default function AddFoodScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState(COMMON_FOODS);
  const [selectedFood, setSelectedFood] = useState(null);
  const [amount, setAmount] = useState('100');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // 從路由參數獲取照片URI
  const photoUri = route?.params?.photoUri;
  
  // 使用自定義Hook
  const { addFoodRecord, loading, error } = useFoodRecords();

  useEffect(() => {
    filterFoods();
  }, [searchQuery]);

  const filterFoods = () => {
    if (searchQuery.trim() === '') {
      setFilteredFoods(COMMON_FOODS);
    } else {
      const filtered = COMMON_FOODS.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFoods(filtered);
    }
  };

  const selectFood = (food) => {
    setSelectedFood(food);
    setShowAddModal(true);
  };

  const calculateNutrition = () => {
    const amountNum = parseFloat(amount) || 0;
    const factor = amountNum / 100; // 營養數據基於100g

    return {
      calories: Math.round(selectedFood.calories * factor),
      carbs: Math.round(selectedFood.carbs * factor * 10) / 10,
      fat: Math.round(selectedFood.fat * factor * 10) / 10,
      protein: Math.round(selectedFood.protein * factor * 10) / 10,
    };
  };

  const addFoodToDay = async () => {
    if (!selectedFood || !amount) {
      Alert.alert('錯誤', '請選擇食物並輸入份量');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('錯誤', '請輸入有效的份量');
      return;
    }

    try {
      const nutrition = calculateNutrition();
      
      const newFoodRecord = {
        name: selectedFood.name,
        amount: amountNum,
        calories: nutrition.calories,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        protein: nutrition.protein,
        date: new Date().toISOString(),
        mealType: 'other', // 可以後續擴展為早餐、午餐、晚餐等
        baseFood: selectedFood,
      };

      const result = await addFoodRecord(newFoodRecord);
      
      if (result) {
        Alert.alert(
          '成功',
          `已添加 ${selectedFood.name} (${amountNum}g) 到今日記錄`,
          [
            {
              text: '確定',
              onPress: () => {
                setShowAddModal(false);
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('錯誤', error || '添加食物失敗，請稍後再試');
      }
    } catch (err) {
      console.error('添加食物失敗:', err);
      Alert.alert('錯誤', '添加食物失敗，請稍後再試');
    }
  };

  const renderFoodItem = ({ item }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => selectFood(item)}
      activeOpacity={0.7}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodNutrition}>
          {item.calories} 卡路里 • 碳水 {item.carbs}g • 脂肪 {item.fat}g • 蛋白質 {item.protein}g
        </Text>
        <Text style={styles.foodPortion}>每 100g</Text>
      </View>
      <MaterialCommunityIcons name="plus-circle" size={24} color="#00CED1" />
    </TouchableOpacity>
  );

  const renderAddModal = () => {
    if (!selectedFood) return null;

    const nutrition = calculateNutrition();

    return (
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加食物</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.selectedFoodInfo}>
              <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
              <Text style={styles.selectedFoodBase}>基準：每 100g</Text>
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>份量 (g)</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor="#A9A9A9"
              />
            </View>

            <View style={styles.nutritionPreview}>
              <Text style={styles.previewTitle}>營養成分預覽</Text>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>卡路里：</Text>
                <Text style={styles.nutritionValue}>{nutrition.calories} 卡</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>碳水化合物：</Text>
                <Text style={styles.nutritionValue}>{nutrition.carbs} g</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>脂肪：</Text>
                <Text style={styles.nutritionValue}>{nutrition.fat} g</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>蛋白質：</Text>
                <Text style={styles.nutritionValue}>{nutrition.protein} g</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addFoodToDay}
              >
                <Text style={styles.addButtonText}>添加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#A9A9A9" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索食物..."
            placeholderTextColor="#A9A9A9"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#A9A9A9" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 照片顯示區域 */}
      {photoUri && (
        <View style={styles.photoContainer}>
          <View style={styles.photoHeader}>
            <MaterialCommunityIcons name="camera" size={20} color="#00CED1" />
            <Text style={styles.photoHeaderText}>拍攝的食物照片</Text>
          </View>
          <View style={styles.photoImageContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoImage} />
            <Text style={styles.photoHint}>請從下方選擇對應的食物</Text>
          </View>
        </View>
      )}

      <View style={styles.resultContainer}>
        <Text style={styles.resultCount}>
          找到 {filteredFoods.length} 種食物
        </Text>
      </View>

      <FlatList
        data={filteredFoods}
        renderItem={renderFoodItem}
        keyExtractor={item => item.id}
        style={styles.foodList}
        showsVerticalScrollIndicator={false}
      />

      {renderAddModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 10,
  },
  resultContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  resultCount: {
    fontSize: 14,
    color: '#A9A9A9',
  },
  foodList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E3A3B',
    borderRadius: 10,
    padding: 15,
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
  foodNutrition: {
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 2,
  },
  foodPortion: {
    fontSize: 10,
    color: '#00CED1',
  },

  // Modal 樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2E3A3B',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 5,
  },
  selectedFoodInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedFoodName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00CED1',
    marginBottom: 5,
  },
  selectedFoodBase: {
    fontSize: 12,
    color: '#A9A9A9',
  },
  amountSection: {
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  amountInput: {
    backgroundColor: '#1C2526',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  nutritionPreview: {
    backgroundColor: '#1C2526',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#A9A9A9',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00CED1',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#4A5657',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#00CED1',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 照片顯示區域樣式
  photoContainer: {
    padding: 15,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  photoHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  photoImageContainer: {
    alignItems: 'center',
  },
  photoImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  photoHint: {
    fontSize: 12,
    color: '#A9A9A9',
  },
}); 