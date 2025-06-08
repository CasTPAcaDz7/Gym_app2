import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useActivities } from '../hooks/useStorage';

export default function TodayWorkoutScreen({ navigation, route }) {
  const { todayFitnessActivities = [] } = route.params || {};
  const [workoutData, setWorkoutData] = useState([]);
  const { updateActivity } = useActivities();

  useEffect(() => {
    initializeWorkoutData();
  }, [todayFitnessActivities]);

  const initializeWorkoutData = () => {
    const workoutSessions = [];
    
    todayFitnessActivities.forEach(activity => {
      if (activity.fitnessGroups && activity.fitnessGroups.length > 0) {
        activity.fitnessGroups.forEach(group => {
          workoutSessions.push({
            activityId: activity.id,
            activityTitle: activity.title,
            groupId: group.id,
            groupName: group.name,
            trainingSets: group.trainingSets.map(set => ({
              ...set,
              currentWeight: set.weight || '',
              completed: false,
            }))
          });
        });
      }
    });
    
    setWorkoutData(workoutSessions);
  };

  const updateSetWeight = (groupId, setId, weight) => {
    setWorkoutData(prev => 
      prev.map(session => {
        if (session.groupId === groupId) {
          return {
            ...session,
            trainingSets: session.trainingSets.map(set => 
              set.id === setId ? { ...set, currentWeight: weight } : set
            )
          };
        }
        return session;
      })
    );
  };

  const markSetComplete = (groupId, setId) => {
    setWorkoutData(prev => 
      prev.map(session => {
        if (session.groupId === groupId) {
          return {
            ...session,
            trainingSets: session.trainingSets.map(set => 
              set.id === setId ? { ...set, completed: !set.completed } : set
            )
          };
        }
        return session;
      })
    );
  };

  const saveWorkoutProgress = async () => {
    try {
      // 這裡可以實現保存邏輯，將更新的重量保存回活動數據
      for (const session of workoutData) {
        const activity = todayFitnessActivities.find(a => a.id === session.activityId);
        if (activity) {
          const updatedActivity = {
            ...activity,
            fitnessGroups: activity.fitnessGroups.map(group => {
              if (group.id === session.groupId) {
                return {
                  ...group,
                  trainingSets: session.trainingSets.map(set => ({
                    ...set,
                    weight: set.currentWeight,
                    previousRecord: set.currentWeight || set.previousRecord,
                  }))
                };
              }
              return group;
            })
          };
          
          await updateActivity(activity.id, updatedActivity);
        }
      }
      
      Alert.alert('成功', '訓練進度已保存！', [
        { text: '確定', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('保存訓練進度失敗:', error);
      Alert.alert('錯誤', '保存失敗，請重試');
    }
  };

  const getCompletedSetsCount = (trainingSets) => {
    return trainingSets.filter(set => set.completed).length;
  };

  const getTotalSetsCount = (trainingSets) => {
    return trainingSets.length;
  };

  if (!todayFitnessActivities || todayFitnessActivities.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#00CED1" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>今日健身訓練</Text>
          <View />
        </View>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="dumbbell" size={64} color="#4A5657" />
          <Text style={styles.emptyText}>今天沒有健身計劃</Text>
          <Text style={styles.emptySubtext}>前往月曆添加健身活動</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      
      {/* 頂部導航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#00CED1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>今日健身訓練</Text>
        <TouchableOpacity onPress={saveWorkoutProgress}>
          <MaterialCommunityIcons name="content-save" size={24} color="#00CED1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {workoutData.map((session, sessionIndex) => (
          <View key={`${session.groupId}_${sessionIndex}`} style={styles.workoutSession}>
            {/* 健身項目標題 */}
            <View style={styles.sessionHeader}>
              <View style={styles.sessionTitleContainer}>
                <MaterialCommunityIcons name="dumbbell" size={20} color="#00CED1" />
                <Text style={styles.sessionTitle}>{session.groupName}</Text>
              </View>
              <View style={styles.sessionStats}>
                <Text style={styles.sessionStatsText}>
                  {getCompletedSetsCount(session.trainingSets)}/{getTotalSetsCount(session.trainingSets)} 組
                </Text>
              </View>
            </View>

            {/* 訓練組表格 */}
            <View style={styles.setsContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>組別</Text>
                <Text style={styles.tableHeaderText}>上次重量</Text>
                <Text style={styles.tableHeaderText}>目標重量</Text>
                <Text style={styles.tableHeaderText}>完成</Text>
              </View>

              {session.trainingSets.map((set, setIndex) => (
                <View key={set.id} style={styles.setRow}>
                  <View style={styles.setNumberContainer}>
                    <Text style={styles.setNumber}>{set.setNumber}</Text>
                  </View>
                  
                  <View style={styles.previousWeightContainer}>
                    <Text style={styles.previousWeight}>{set.previousRecord}</Text>
                  </View>
                  
                  <View style={styles.currentWeightContainer}>
                    <TextInput
                      style={[
                        styles.weightInput,
                        set.completed && styles.completedInput
                      ]}
                      value={set.currentWeight}
                      onChangeText={(text) => updateSetWeight(session.groupId, set.id, text)}
                      placeholder="重量"
                      placeholderTextColor="#666666"
                      maxLength={20}
                      editable={!set.completed}
                    />
                  </View>

                  <View style={styles.completeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.completeButton,
                        set.completed && styles.completedButton
                      ]}
                      onPress={() => markSetComplete(session.groupId, set.id)}
                    >
                      <MaterialCommunityIcons 
                        name={set.completed ? "check" : "check-outline"} 
                        size={20} 
                        color={set.completed ? "#ffffff" : "#00CED1"} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* 底部保存按鈕 */}
        <TouchableOpacity style={styles.saveButton} onPress={saveWorkoutProgress}>
          <MaterialCommunityIcons name="content-save" size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>保存訓練進度</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3A3B',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#A9A9A9',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
  },
  workoutSession: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C2526',
  },
  sessionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sessionStats: {
    backgroundColor: '#1C2526',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sessionStatsText: {
    color: '#00CED1',
    fontSize: 12,
    fontWeight: '600',
  },
  setsContainer: {
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4A5657',
    marginBottom: 8,
  },
  tableHeaderText: {
    color: '#A9A9A9',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  setNumberContainer: {
    flex: 1,
    alignItems: 'center',
  },
  setNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  previousWeightContainer: {
    flex: 1,
    alignItems: 'center',
  },
  previousWeight: {
    color: '#A9A9A9',
    fontSize: 14,
  },
  currentWeightContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weightInput: {
    color: '#ffffff',
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#4A5657',
    borderRadius: 6,
    backgroundColor: '#1C2526',
    textAlign: 'center',
    width: 60,
  },
  completedInput: {
    backgroundColor: '#00CED1',
    borderColor: '#00CED1',
    color: '#ffffff',
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#00CED1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#00CED1',
  },
  saveButton: {
    backgroundColor: '#00CED1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 