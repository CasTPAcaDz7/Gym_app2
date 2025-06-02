import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ExerciseScreen({ navigation }) {
  const exerciseCategories = [
    {
      id: 1,
      name: '重量訓練',
      icon: 'dumbbell',
      color: '#FF6B6B',
      description: '力量訓練和肌肉建構'
    },
    {
      id: 2,
      name: '有氧運動',
      icon: 'run',
      color: '#4ECDC4',
      description: '心肺功能和耐力訓練'
    },
    {
      id: 3,
      name: '瑜伽',
      icon: 'meditation',
      color: '#45B7D1',
      description: '柔韌性和平衡訓練'
    },
    {
      id: 4,
      name: '游泳',
      icon: 'swim',
      color: '#96CEB4',
      description: '全身有氧運動'
    },
    {
      id: 5,
      name: '運動記錄',
      icon: 'clipboard-list',
      color: '#FFEAA7',
      description: '查看運動歷史記錄'
    }
  ];

  const handleCategoryPress = (category) => {
    if (category.id === 5) {
      // 導航到運動記錄頁面
      navigation.navigate('ExerciseRecord');
    } else {
      // 其他運動類別暫時顯示提示
      console.log(`選擇了${category.name}`);
    }
  };

  const renderExerciseCard = (category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.exerciseCard}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
        <MaterialCommunityIcons 
          name={category.icon} 
          size={32} 
          color="#ffffff" 
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>
      <MaterialCommunityIcons 
        name="chevron-right" 
        size={24} 
        color="#A9A9A9" 
      />
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Exercise</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>開始您的運動</Text>
          <Text style={styles.welcomeSubtitle}>選擇運動類型或查看記錄</Text>
        </View>

        <View style={styles.categoriesContainer}>
          {exerciseCategories.map(renderExerciseCard)}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>本週統計</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>運動次數</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>120</Text>
              <Text style={styles.statLabel}>分鐘</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>450</Text>
              <Text style={styles.statLabel}>卡路里</Text>
            </View>
          </View>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#A9A9A9',
    textAlign: 'center',
  },
  categoriesContainer: {
    marginBottom: 30,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#A9A9A9',
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00CED1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#A9A9A9',
    textAlign: 'center',
  },
}); 