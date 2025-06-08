import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Alert, TouchableOpacity, Animated, Dimensions } from 'react-native';

// 導入各個頁面組件
import CalendarScreen from '../screens/CalendarScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CommunityScreen from '../screens/CommunityScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';

// 導入飲食相關頁面
import DietScreen from '../screens/DietScreen';
import AddFoodScreen from '../screens/AddFoodScreen';
import WeightRecordScreen from '../screens/WeightRecordScreen';
import ExerciseRecordScreen from '../screens/ExerciseRecordScreen';
import FoodPhotoScreen from '../screens/FoodPhotoScreen';

// 導入新的添加活動頁面
import AddActivityScreen from '../screens/AddActivityScreen';

// 導入卡路里分析頁面
import CaloriesAnalyticsScreen from '../screens/CaloriesAnalyticsScreen';

// 導入食品數據庫頁面
import FoodDatabaseScreen from '../screens/FoodDatabaseScreen';

// 導入新的Check-In和Weight-In頁面
import CheckInScreen from '../screens/CheckInScreen';
import WeightInScreen from '../screens/WeightInScreen';

// 導入新的Exercise頁面
import ExerciseScreen from '../screens/ExerciseScreen';

// 導入今日健身訓練頁面
import TodayWorkoutScreen from '../screens/TodayWorkoutScreen';

// 導入個人檔案頁面
import ProfileScreen from '../screens/ProfileScreen';

// 導入新增的聊天室和教練管理頁面
import ChatRoomScreen from '../screens/ChatRoomScreen';
import CoachManageScreen from '../screens/CoachManageScreen';
import PhotoCropScreen from '../screens/PhotoCropScreen';
import FindCoachScreen from '../screens/FindCoachScreen';

// 導入半圓形彈出組件
// import SemicirclePopup from '../components/SemicirclePopup';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 飲食相關頁面的 Stack Navigator
function DietStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1C2526',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="DietMain" 
        component={DietScreen} 
        options={{ headerTitle: '飲食記錄' }}
      />
      <Stack.Screen 
        name="AddFood" 
        component={AddFoodScreen} 
        options={{ headerTitle: '記錄食品' }}
      />
      <Stack.Screen 
        name="WeightRecord" 
        component={WeightRecordScreen} 
        options={{ headerTitle: '體重記錄' }}
      />
      <Stack.Screen 
        name="ExerciseRecord" 
        component={ExerciseRecordScreen} 
        options={{ headerTitle: '運動記錄' }}
      />
      <Stack.Screen 
        name="FoodPhoto" 
        component={FoodPhotoScreen} 
        options={{ headerTitle: '食品拍照' }}
      />
    </Stack.Navigator>
  );
}

// Dashboard 的 Stack Navigator
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1C2526',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="DashboardMain" 
        component={DashboardScreen} 
        options={{ headerTitle: 'Dashboard' }}
      />
      <Stack.Screen 
        name="Diet" 
        component={DietStack} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CaloriesAnalytics" 
        component={CaloriesAnalyticsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FoodDatabase" 
        component={FoodDatabaseScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CheckIn" 
        component={CheckInScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="WeightIn" 
        component={WeightInScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Exercise" 
        component={ExerciseScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TodayWorkout" 
        component={TodayWorkoutScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Calendar 的 Stack Navigator
function CalendarStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1C2526',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="CalendarMain" 
        component={CalendarScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddActivity" 
        component={AddActivityScreen} 
        options={{ 
          headerShown: false,
          gestureDirection: 'horizontal-inverted',
          cardStyleInterpolator: ({ current, next, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
              overlayStyle: {
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            };
          },
        }}
      />
    </Stack.Navigator>
  );
}

// Community 的 Stack Navigator
function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1C2526',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="CommunityMain" 
        component={CommunityScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CoachManage" 
        component={CoachManageScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PhotoCrop" 
        component={PhotoCropScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FindCoach" 
        component={FindCoachScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// 自定義TabBar組件，移除動畫邏輯
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={{ position: 'relative' }}>
      {/* 原始TabBar */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#000000',
          borderTopColor: '#333333',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          position: 'relative',
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
            }
          };

          let iconName;
          if (route.name === 'Calendar') {
            iconName = isFocused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Dashboard') {
            iconName = isFocused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Community') {
            iconName = isFocused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'Library') {
            iconName = isFocused ? 'book' : 'book-outline';
          } else if (route.name === 'Settings') {
            iconName = isFocused ? 'cog' : 'cog-outline';
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons 
                name={iconName} 
                size={28} 
                color={isFocused ? '#ffffff' : '#888888'} 
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// 創建一個全局動畫控制器
const AnimationController = {
  slideAnimation: null,
  initAnimation: function() {
    if (!this.slideAnimation) {
      this.slideAnimation = new Animated.Value(0);
    }
    return this.slideAnimation;
  },
  triggerSlideFromRight: function() {
    if (this.slideAnimation) {
      this.slideAnimation.setValue(1);
      Animated.timing(this.slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }
};

export { AnimationController };

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Dashboard"
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardStack}
        />
        <Tab.Screen 
          name="Calendar" 
          component={CalendarStack}
        />
        <Tab.Screen 
          name="Community" 
          component={CommunityStack}
        />
        <Tab.Screen 
          name="Library" 
          component={LibraryScreen}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
} 