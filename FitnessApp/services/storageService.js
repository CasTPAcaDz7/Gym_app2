import AsyncStorage from '@react-native-async-storage/async-storage';

// 儲存鍵值常數
const STORAGE_KEYS = {
  ACTIVITIES: '@fitness_app_activities',
  FOODS: '@fitness_app_foods',
  EXERCISES: '@fitness_app_exercises',
  WEIGHT_RECORDS: '@fitness_app_weight_records',
  USER_SETTINGS: '@fitness_app_user_settings'
};

// 生成唯一ID的函數
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 通用儲存操作類
class StorageService {
  // 獲取所有數據
  async getData(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return [];
    }
  }

  // 儲存數據
  async saveData(key, data) {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      return false;
    }
  }

  // 清除特定鍵的數據
  async clearData(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error clearing data for key ${key}:`, error);
      return false;
    }
  }

  // 清除所有應用數據
  async clearAllData() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // ==================== 活動相關操作 ====================
  
  // 獲取所有活動
  async getActivities() {
    return await this.getData(STORAGE_KEYS.ACTIVITIES);
  }

  // 根據日期範圍獲取活動
  async getActivitiesByDateRange(startDate, endDate) {
    const activities = await this.getActivities();
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= endDate;
    });
  }

  // 根據日期獲取活動
  async getActivitiesByDate(date) {
    const activities = await this.getActivities();
    const targetDate = new Date(date).toDateString();
    return activities.filter(activity => 
      new Date(activity.date).toDateString() === targetDate
    );
  }

  // 新增活動
  async addActivity(activityData) {
    try {
      const activities = await this.getActivities();
      const newActivity = {
        id: generateId(),
        ...activityData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      activities.push(newActivity);
      const success = await this.saveData(STORAGE_KEYS.ACTIVITIES, activities);
      return success ? newActivity : null;
    } catch (error) {
      console.error('Error adding activity:', error);
      return null;
    }
  }

  // 更新活動
  async updateActivity(activityId, updateData) {
    try {
      const activities = await this.getActivities();
      const index = activities.findIndex(activity => activity.id === activityId);
      if (index === -1) return false;

      activities[index] = {
        ...activities[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      return await this.saveData(STORAGE_KEYS.ACTIVITIES, activities);
    } catch (error) {
      console.error('Error updating activity:', error);
      return false;
    }
  }

  // 刪除活動
  async deleteActivity(activityId) {
    try {
      const activities = await this.getActivities();
      const filteredActivities = activities.filter(activity => activity.id !== activityId);
      return await this.saveData(STORAGE_KEYS.ACTIVITIES, filteredActivities);
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    }
  }

  // ==================== 食物相關操作 ====================
  
  // 獲取所有食物記錄
  async getFoodRecords() {
    return await this.getData(STORAGE_KEYS.FOODS);
  }

  // 根據日期獲取食物記錄
  async getFoodRecordsByDate(date) {
    const foods = await this.getFoodRecords();
    const targetDate = new Date(date).toDateString();
    return foods.filter(food => 
      new Date(food.date).toDateString() === targetDate
    );
  }

  // 新增食物記錄
  async addFoodRecord(foodData) {
    try {
      const foods = await this.getFoodRecords();
      const newFood = {
        id: generateId(),
        ...foodData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      foods.push(newFood);
      const success = await this.saveData(STORAGE_KEYS.FOODS, foods);
      return success ? newFood : null;
    } catch (error) {
      console.error('Error adding food record:', error);
      return null;
    }
  }

  // 更新食物記錄
  async updateFoodRecord(foodId, updateData) {
    try {
      const foods = await this.getFoodRecords();
      const index = foods.findIndex(food => food.id === foodId);
      if (index === -1) return false;

      foods[index] = {
        ...foods[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      return await this.saveData(STORAGE_KEYS.FOODS, foods);
    } catch (error) {
      console.error('Error updating food record:', error);
      return false;
    }
  }

  // 刪除食物記錄
  async deleteFoodRecord(foodId) {
    try {
      const foods = await this.getFoodRecords();
      const filteredFoods = foods.filter(food => food.id !== foodId);
      return await this.saveData(STORAGE_KEYS.FOODS, filteredFoods);
    } catch (error) {
      console.error('Error deleting food record:', error);
      return false;
    }
  }

  // ==================== 運動相關操作 ====================
  
  // 獲取所有運動記錄
  async getExerciseRecords() {
    return await this.getData(STORAGE_KEYS.EXERCISES);
  }

  // 根據日期獲取運動記錄
  async getExerciseRecordsByDate(date) {
    const exercises = await this.getExerciseRecords();
    const targetDate = new Date(date).toDateString();
    return exercises.filter(exercise => 
      new Date(exercise.date).toDateString() === targetDate
    );
  }

  // 新增運動記錄
  async addExerciseRecord(exerciseData) {
    try {
      const exercises = await this.getExerciseRecords();
      const newExercise = {
        id: generateId(),
        ...exerciseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      exercises.push(newExercise);
      const success = await this.saveData(STORAGE_KEYS.EXERCISES, exercises);
      return success ? newExercise : null;
    } catch (error) {
      console.error('Error adding exercise record:', error);
      return null;
    }
  }

  // 更新運動記錄
  async updateExerciseRecord(exerciseId, updateData) {
    try {
      const exercises = await this.getExerciseRecords();
      const index = exercises.findIndex(exercise => exercise.id === exerciseId);
      if (index === -1) return false;

      exercises[index] = {
        ...exercises[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      return await this.saveData(STORAGE_KEYS.EXERCISES, exercises);
    } catch (error) {
      console.error('Error updating exercise record:', error);
      return false;
    }
  }

  // 刪除運動記錄
  async deleteExerciseRecord(exerciseId) {
    try {
      const exercises = await this.getExerciseRecords();
      const filteredExercises = exercises.filter(exercise => exercise.id !== exerciseId);
      return await this.saveData(STORAGE_KEYS.EXERCISES, filteredExercises);
    } catch (error) {
      console.error('Error deleting exercise record:', error);
      return false;
    }
  }

  // ==================== 體重相關操作 ====================
  
  // 獲取所有體重記錄
  async getWeightRecords() {
    return await this.getData(STORAGE_KEYS.WEIGHT_RECORDS);
  }

  // 獲取最新體重記錄
  async getLatestWeightRecord() {
    const weights = await this.getWeightRecords();
    if (weights.length === 0) return null;
    
    return weights.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }

  // 根據日期範圍獲取體重記錄
  async getWeightRecordsByDateRange(startDate, endDate) {
    const weights = await this.getWeightRecords();
    return weights.filter(weight => {
      const weightDate = new Date(weight.date);
      return weightDate >= startDate && weightDate <= endDate;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // 新增體重記錄
  async addWeightRecord(weightData) {
    try {
      const weights = await this.getWeightRecords();
      const newWeight = {
        id: generateId(),
        ...weightData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      weights.push(newWeight);
      const success = await this.saveData(STORAGE_KEYS.WEIGHT_RECORDS, weights);
      return success ? newWeight : null;
    } catch (error) {
      console.error('Error adding weight record:', error);
      return null;
    }
  }

  // 更新體重記錄
  async updateWeightRecord(weightId, updateData) {
    try {
      const weights = await this.getWeightRecords();
      const index = weights.findIndex(weight => weight.id === weightId);
      if (index === -1) return false;

      weights[index] = {
        ...weights[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      return await this.saveData(STORAGE_KEYS.WEIGHT_RECORDS, weights);
    } catch (error) {
      console.error('Error updating weight record:', error);
      return false;
    }
  }

  // 刪除體重記錄
  async deleteWeightRecord(weightId) {
    try {
      const weights = await this.getWeightRecords();
      const filteredWeights = weights.filter(weight => weight.id !== weightId);
      return await this.saveData(STORAGE_KEYS.WEIGHT_RECORDS, filteredWeights);
    } catch (error) {
      console.error('Error deleting weight record:', error);
      return false;
    }
  }

  // ==================== 用戶設定相關操作 ====================
  
  // 獲取用戶設定
  async getUserSettings() {
    const settings = await this.getData(STORAGE_KEYS.USER_SETTINGS);
    return settings.length > 0 ? settings[0] : null;
  }

  // 儲存用戶設定
  async saveUserSettings(settingsData) {
    try {
      const settings = {
        id: 'user_settings',
        ...settingsData,
        updatedAt: new Date().toISOString()
      };
      return await this.saveData(STORAGE_KEYS.USER_SETTINGS, [settings]);
    } catch (error) {
      console.error('Error saving user settings:', error);
      return false;
    }
  }

  // ==================== 統計相關操作 ====================
  
  // 獲取今日總覽數據
  async getTodayOverview() {
    const today = new Date();
    const todayStr = today.toDateString();

    try {
      const [activities, foods, exercises, weightRecords] = await Promise.all([
        this.getActivitiesByDate(today),
        this.getFoodRecordsByDate(today),
        this.getExerciseRecordsByDate(today),
        this.getLatestWeightRecord()
      ]);

      // 計算總卡路里攝入
      const totalCaloriesIntake = foods.reduce((sum, food) => sum + (food.calories || 0), 0);
      
      // 計算總卡路里消耗
      const totalCaloriesBurned = exercises.reduce((sum, exercise) => sum + (exercise.caloriesBurned || 0), 0);

      // 計算淨卡路里
      const netCalories = totalCaloriesIntake - totalCaloriesBurned;

      return {
        date: todayStr,
        activitiesCount: activities.length,
        foodsCount: foods.length,
        exercisesCount: exercises.length,
        totalCaloriesIntake,
        totalCaloriesBurned,
        netCalories,
        currentWeight: weightRecords?.weight || null,
        lastWeightDate: weightRecords?.date || null
      };
    } catch (error) {
      console.error('Error getting today overview:', error);
      return null;
    }
  }

  // 獲取週統計數據
  async getWeeklyStats() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6); // 過去7天

    try {
      const [activities, foods, exercises] = await Promise.all([
        this.getActivitiesByDateRange(weekStart, today),
        this.getData(STORAGE_KEYS.FOODS),
        this.getData(STORAGE_KEYS.EXERCISES)
      ]);

      // 按日期分組統計
      const dailyStats = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = date.toDateString();
        
        const dayFoods = foods.filter(food => 
          new Date(food.date).toDateString() === dateStr
        );
        const dayExercises = exercises.filter(exercise => 
          new Date(exercise.date).toDateString() === dateStr
        );

        dailyStats[dateStr] = {
          date: dateStr,
          caloriesIntake: dayFoods.reduce((sum, food) => sum + (food.calories || 0), 0),
          caloriesBurned: dayExercises.reduce((sum, exercise) => sum + (exercise.caloriesBurned || 0), 0),
          activitiesCount: activities.filter(activity => 
            new Date(activity.date).toDateString() === dateStr
          ).length
        };
      }

      return dailyStats;
    } catch (error) {
      console.error('Error getting weekly stats:', error);
      return {};
    }
  }
}

// 創建並導出服務實例
const storageService = new StorageService();
export default storageService;

// 導出儲存鍵值常數，供其他地方使用
export { STORAGE_KEYS }; 