import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storageService from '../services/storageService';

const DataMigrationManager = ({ children }) => {
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAndMigrate();
  }, []);

  const checkAndMigrate = async () => {
    try {
      // 檢查是否已經完成遷移
      const migrationFlag = await AsyncStorage.getItem('@migration_completed');
      
      if (migrationFlag === 'true') {
        setMigrationComplete(true);
        setIsChecking(false);
        return;
      }

      // 開始遷移舊數據
      await migrateOldData();
      
      // 標記遷移完成
      await AsyncStorage.setItem('@migration_completed', 'true');
      setMigrationComplete(true);
      
    } catch (error) {
      console.error('數據遷移失敗:', error);
      // 即使遷移失敗，也要讓應用正常運行
      setMigrationComplete(true);
    } finally {
      setIsChecking(false);
    }
  };

  const migrateOldData = async () => {
    console.log('開始遷移舊數據...');
    
    try {
      // 遷移飲食數據
      await migrateDietData();
      
      console.log('數據遷移完成');
    } catch (error) {
      console.error('遷移過程中出錯:', error);
    }
  };

  const migrateDietData = async () => {
    try {
      // 獲取過去30天的飲食數據
      const today = new Date();
      const promises = [];
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const oldKey = `diet_${dateStr}`;
        
        promises.push(migrateOneDayDiet(oldKey, date));
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('遷移飲食數據失敗:', error);
    }
  };

  const migrateOneDayDiet = async (oldKey, date) => {
    try {
      const oldData = await AsyncStorage.getItem(oldKey);
      
      if (oldData) {
        const parsedData = JSON.parse(oldData);
        
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // 轉換為新格式
          for (const oldFood of parsedData) {
            const newFoodRecord = {
              name: oldFood.name || '未知食物',
              amount: oldFood.amount || 100,
              calories: oldFood.totalCalories || oldFood.calories || 0,
              carbs: oldFood.carbs || 0,
              fat: oldFood.fat || 0,
              protein: oldFood.protein || 0,
              date: date.toISOString(),
              mealType: 'migrated',
              migrated: true,
            };
            
            await storageService.addFoodRecord(newFoodRecord);
          }
          
          console.log(`遷移 ${dateStr} 的 ${parsedData.length} 條飲食記錄`);
        }
      }
    } catch (error) {
      console.error(`遷移 ${oldKey} 失敗:`, error);
    }
  };

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C2526' }}>
        <Text style={{ color: '#ffffff', fontSize: 16 }}>正在初始化應用...</Text>
        <Text style={{ color: '#A9A9A9', fontSize: 12, marginTop: 8 }}>檢查數據完整性</Text>
      </View>
    );
  }

  return children;
};

export default DataMigrationManager; 