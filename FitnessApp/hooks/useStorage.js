import { useState, useEffect, useCallback } from 'react';
import storageService from '../services/storageService';

// 通用數據管理Hook
export const useStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 清除錯誤
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 通用數據操作wrapper
  const executeOperation = useCallback(async (operation, loadingMessage = '處理中...') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      console.error('Storage operation error:', err);
      setError(err.message || '操作失敗');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    clearError,
    executeOperation
  };
};

// 活動數據管理Hook
export const useActivities = () => {
  const [activities, setActivities] = useState([]);
  const [todayActivities, setTodayActivities] = useState([]);
  const { loading, error, clearError, executeOperation } = useStorage();

  // 載入所有活動
  const loadActivities = useCallback(async () => {
    const result = await executeOperation(async () => {
      const data = await storageService.getActivities();
      setActivities(data);
      return data;
    });
    return result;
  }, [executeOperation]);

  // 載入今日活動
  const loadTodayActivities = useCallback(async () => {
    const result = await executeOperation(async () => {
      const today = new Date();
      const data = await storageService.getActivitiesByDate(today);
      setTodayActivities(data);
      return data;
    });
    return result;
  }, [executeOperation]);

  // 載入指定日期的活動
  const loadActivitiesByDate = useCallback(async (date) => {
    return await executeOperation(async () => {
      return await storageService.getActivitiesByDate(date);
    });
  }, [executeOperation]);

  // 新增活動
  const addActivity = useCallback(async (activityData) => {
    const result = await executeOperation(async () => {
      const newActivity = await storageService.addActivity(activityData);
      if (newActivity) {
        // 更新本地狀態
        setActivities(prev => [...prev, newActivity]);
        
        // 如果是今日活動，也更新今日活動列表
        const today = new Date().toDateString();
        const activityDate = new Date(newActivity.date).toDateString();
        if (activityDate === today) {
          setTodayActivities(prev => [...prev, newActivity]);
        }
      }
      return newActivity;
    });
    return result;
  }, [executeOperation]);

  // 更新活動
  const updateActivity = useCallback(async (activityId, updateData) => {
    const result = await executeOperation(async () => {
      const success = await storageService.updateActivity(activityId, updateData);
      if (success) {
        // 重新載入數據
        await loadActivities();
        await loadTodayActivities();
      }
      return success;
    });
    return result;
  }, [executeOperation, loadActivities, loadTodayActivities]);

  // 刪除活動
  const deleteActivity = useCallback(async (activityId) => {
    const result = await executeOperation(async () => {
      const success = await storageService.deleteActivity(activityId);
      if (success) {
        // 更新本地狀態
        setActivities(prev => prev.filter(activity => activity.id !== activityId));
        setTodayActivities(prev => prev.filter(activity => activity.id !== activityId));
      }
      return success;
    });
    return result;
  }, [executeOperation]);

  // 初始載入
  useEffect(() => {
    loadActivities();
    loadTodayActivities();
  }, []);

  return {
    activities,
    todayActivities,
    loading,
    error,
    clearError,
    loadActivities,
    loadTodayActivities,
    loadActivitiesByDate,
    addActivity,
    updateActivity,
    deleteActivity
  };
};

// 食物記錄管理Hook
export const useFoodRecords = () => {
  const [foodRecords, setFoodRecords] = useState([]);
  const [todayFoods, setTodayFoods] = useState([]);
  const { loading, error, clearError, executeOperation } = useStorage();

  // 載入所有食物記錄
  const loadFoodRecords = useCallback(async () => {
    const result = await executeOperation(async () => {
      const data = await storageService.getFoodRecords();
      setFoodRecords(data);
      return data;
    });
    return result;
  }, [executeOperation]);

  // 載入今日食物記錄
  const loadTodayFoods = useCallback(async () => {
    const result = await executeOperation(async () => {
      const today = new Date();
      const data = await storageService.getFoodRecordsByDate(today);
      setTodayFoods(data);
      return data;
    });
    return result;
  }, [executeOperation]);

  // 載入指定日期的食物記錄
  const loadFoodRecordsByDate = useCallback(async (date) => {
    return await executeOperation(async () => {
      return await storageService.getFoodRecordsByDate(date);
    });
  }, [executeOperation]);

  // 新增食物記錄
  const addFoodRecord = useCallback(async (foodData) => {
    const result = await executeOperation(async () => {
      const newFood = await storageService.addFoodRecord(foodData);
      if (newFood) {
        setFoodRecords(prev => [...prev, newFood]);
        
        // 如果是今日記錄，也更新今日列表
        const today = new Date().toDateString();
        const foodDate = new Date(newFood.date).toDateString();
        if (foodDate === today) {
          setTodayFoods(prev => [...prev, newFood]);
        }
      }
      return newFood;
    });
    return result;
  }, [executeOperation]);

  // 更新食物記錄
  const updateFoodRecord = useCallback(async (foodId, updateData) => {
    const result = await executeOperation(async () => {
      const success = await storageService.updateFoodRecord(foodId, updateData);
      if (success) {
        await loadFoodRecords();
        await loadTodayFoods();
      }
      return success;
    });
    return result;
  }, [executeOperation, loadFoodRecords, loadTodayFoods]);

  // 刪除食物記錄
  const deleteFoodRecord = useCallback(async (foodId) => {
    const result = await executeOperation(async () => {
      const success = await storageService.deleteFoodRecord(foodId);
      if (success) {
        setFoodRecords(prev => prev.filter(food => food.id !== foodId));
        setTodayFoods(prev => prev.filter(food => food.id !== foodId));
      }
      return success;
    });
    return result;
  }, [executeOperation]);

  // 計算今日總卡路里
  const getTodayTotalCalories = useCallback(() => {
    return todayFoods.reduce((total, food) => total + (food.calories || 0), 0);
  }, [todayFoods]);

  // 初始載入
  useEffect(() => {
    loadFoodRecords();
    loadTodayFoods();
  }, []);

  return {
    foodRecords,
    allFoodRecords: foodRecords,
    todayFoods,
    loading,
    error,
    clearError,
    loadFoodRecords,
    loadTodayFoods,
    loadFoodRecordsByDate,
    addFoodRecord,
    updateFoodRecord,
    deleteFoodRecord,
    getTodayTotalCalories
  };
};

// 運動記錄管理Hook
export const useExerciseRecords = () => {
  const [exerciseRecords, setExerciseRecords] = useState([]);
  const [todayExercises, setTodayExercises] = useState([]);
  const { loading, error, clearError, executeOperation } = useStorage();

  // 載入所有運動記錄
  const loadExerciseRecords = useCallback(async () => {
    const result = await executeOperation(async () => {
      const data = await storageService.getExerciseRecords();
      setExerciseRecords(data);
      return data;
    });
    return result;
  }, [executeOperation]);

  // 載入今日運動記錄
  const loadTodayExercises = useCallback(async () => {
    const result = await executeOperation(async () => {
      const today = new Date();
      const data = await storageService.getExerciseRecordsByDate(today);
      setTodayExercises(data);
      return data;
    });
    return result;
  }, [executeOperation]);

  // 載入指定日期的運動記錄
  const loadExerciseRecordsByDate = useCallback(async (date) => {
    return await executeOperation(async () => {
      return await storageService.getExerciseRecordsByDate(date);
    });
  }, [executeOperation]);

  // 新增運動記錄
  const addExerciseRecord = useCallback(async (exerciseData) => {
    const result = await executeOperation(async () => {
      const newExercise = await storageService.addExerciseRecord(exerciseData);
      if (newExercise) {
        setExerciseRecords(prev => [...prev, newExercise]);
        
        // 如果是今日記錄，也更新今日列表
        const today = new Date().toDateString();
        const exerciseDate = new Date(newExercise.date).toDateString();
        if (exerciseDate === today) {
          setTodayExercises(prev => [...prev, newExercise]);
        }
      }
      return newExercise;
    });
    return result;
  }, [executeOperation]);

  // 更新運動記錄
  const updateExerciseRecord = useCallback(async (exerciseId, updateData) => {
    const result = await executeOperation(async () => {
      const success = await storageService.updateExerciseRecord(exerciseId, updateData);
      if (success) {
        await loadExerciseRecords();
        await loadTodayExercises();
      }
      return success;
    });
    return result;
  }, [executeOperation, loadExerciseRecords, loadTodayExercises]);

  // 刪除運動記錄
  const deleteExerciseRecord = useCallback(async (exerciseId) => {
    const result = await executeOperation(async () => {
      const success = await storageService.deleteExerciseRecord(exerciseId);
      if (success) {
        setExerciseRecords(prev => prev.filter(exercise => exercise.id !== exerciseId));
        setTodayExercises(prev => prev.filter(exercise => exercise.id !== exerciseId));
      }
      return success;
    });
    return result;
  }, [executeOperation]);

  // 計算今日總消耗卡路里
  const getTodayTotalCaloriesBurned = useCallback(() => {
    return todayExercises.reduce((total, exercise) => total + (exercise.caloriesBurned || 0), 0);
  }, [todayExercises]);

  // 初始載入
  useEffect(() => {
    loadExerciseRecords();
    loadTodayExercises();
  }, []);

  return {
    exerciseRecords,
    todayExercises,
    loading,
    error,
    clearError,
    loadExerciseRecords,
    loadTodayExercises,
    loadExerciseRecordsByDate,
    addExerciseRecord,
    updateExerciseRecord,
    deleteExerciseRecord,
    getTodayTotalCaloriesBurned
  };
};

// 體重記錄管理Hook
export const useWeightRecords = () => {
  const [weightRecords, setWeightRecords] = useState([]);
  const [latestWeight, setLatestWeight] = useState(null);
  const { loading, error, clearError, executeOperation } = useStorage();

  // 載入所有體重記錄
  const loadWeightRecords = useCallback(async () => {
    const result = await executeOperation(async () => {
      const data = await storageService.getWeightRecords();
      setWeightRecords(data);
      return data;
    });
    return result;
  }, [executeOperation]);

  // 載入最新體重記錄
  const loadLatestWeight = useCallback(async () => {
    const result = await executeOperation(async () => {
      const data = await storageService.getLatestWeightRecord();
      setLatestWeight(data);
      return data;
    });
    return result;
  }, [executeOperation]);

  // 載入指定日期範圍的體重記錄
  const loadWeightRecordsByDateRange = useCallback(async (startDate, endDate) => {
    return await executeOperation(async () => {
      return await storageService.getWeightRecordsByDateRange(startDate, endDate);
    });
  }, [executeOperation]);

  // 新增體重記錄
  const addWeightRecord = useCallback(async (weightData) => {
    const result = await executeOperation(async () => {
      const newWeight = await storageService.addWeightRecord(weightData);
      if (newWeight) {
        setWeightRecords(prev => [...prev, newWeight]);
        // 更新最新體重（如果新記錄的日期更近）
        if (!latestWeight || new Date(newWeight.date) > new Date(latestWeight.date)) {
          setLatestWeight(newWeight);
        }
      }
      return newWeight;
    });
    return result;
  }, [executeOperation, latestWeight]);

  // 更新體重記錄
  const updateWeightRecord = useCallback(async (weightId, updateData) => {
    const result = await executeOperation(async () => {
      const success = await storageService.updateWeightRecord(weightId, updateData);
      if (success) {
        await loadWeightRecords();
        await loadLatestWeight();
      }
      return success;
    });
    return result;
  }, [executeOperation, loadWeightRecords, loadLatestWeight]);

  // 刪除體重記錄
  const deleteWeightRecord = useCallback(async (weightId) => {
    const result = await executeOperation(async () => {
      const success = await storageService.deleteWeightRecord(weightId);
      if (success) {
        setWeightRecords(prev => prev.filter(weight => weight.id !== weightId));
        // 如果刪除的是最新記錄，重新載入最新記錄
        if (latestWeight && latestWeight.id === weightId) {
          await loadLatestWeight();
        }
      }
      return success;
    });
    return result;
  }, [executeOperation, latestWeight, loadLatestWeight]);

  // 初始載入
  useEffect(() => {
    loadWeightRecords();
    loadLatestWeight();
  }, []);

  return {
    weightRecords,
    latestWeight,
    loading,
    error,
    clearError,
    loadWeightRecords,
    loadLatestWeight,
    loadWeightRecordsByDateRange,
    addWeightRecord,
    updateWeightRecord,
    deleteWeightRecord
  };
};

// 統計數據管理Hook
export const useStats = () => {
  const [todayOverview, setTodayOverview] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({});
  const { loading, error, clearError, executeOperation } = useStorage();

  // 載入今日總覽
  const loadTodayOverview = useCallback(async () => {
    const result = await executeOperation(async () => {
      const data = await storageService.getTodayOverview();
      setTodayOverview(data);
      return data;
    });
    return result;
  }, [executeOperation]);

  // 載入週統計
  const loadWeeklyStats = useCallback(async () => {
    const result = await executeOperation(async () => {
      const data = await storageService.getWeeklyStats();
      setWeeklyStats(data);
      return data;
    });
    return result;
  }, [executeOperation]);

  // 刷新所有統計數據
  const refreshStats = useCallback(async () => {
    await Promise.all([
      loadTodayOverview(),
      loadWeeklyStats()
    ]);
  }, [loadTodayOverview, loadWeeklyStats]);

  // 初始載入
  useEffect(() => {
    refreshStats();
  }, []);

  return {
    todayOverview,
    weeklyStats,
    loading,
    error,
    clearError,
    loadTodayOverview,
    loadWeeklyStats,
    refreshStats
  };
}; 