import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width: screenWidth } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState({
    name: '用戶',
    avatar: 'account-circle',
    height: 170,
    weight: 65,
    age: 25,
    goal: '減重',
    joinDate: '2024-01-01',
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState('');
  const [editValue, setEditValue] = useState('');
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // 頭像選項
  const avatarOptions = [
    'account-circle',
    'account',
    'face-man',
    'face-woman',
    'emoticon',
    'emoticon-happy',
    'emoticon-cool',
    'heart'
  ];

  // 健身目標選項
  const goalOptions = ['減重', '增肌', '維持體重', '體能提升', '健康生活'];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      if (profileData) {
        const parsedData = JSON.parse(profileData);
        setUserProfile(prevData => ({
          ...prevData,
          ...parsedData
        }));
      }
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    }
  };

  const saveUserProfile = async (newData) => {
    try {
      const updatedProfile = { ...userProfile, ...newData };
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('保存用戶資料失敗:', error);
      Alert.alert('錯誤', '保存失敗，請重試');
    }
  };

  // 處理編輯
  const handleEdit = (type, currentValue) => {
    setEditType(type);
    setEditValue(currentValue.toString());
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editValue.trim()) {
      Alert.alert('錯誤', '請輸入有效值');
      return;
    }

    let newValue = editValue;
    if (editType === 'height' || editType === 'weight' || editType === 'age') {
      newValue = parseFloat(editValue);
      if (isNaN(newValue)) {
        Alert.alert('錯誤', '請輸入有效數字');
        return;
      }
    }

    saveUserProfile({ [editType]: newValue });
    setEditModalVisible(false);
  };

  // 頭像相關功能
  const openAvatarOptions = () => {
    setAvatarModalVisible(true);
  };

  const selectSystemAvatar = (avatar) => {
    saveUserProfile({ avatar });
    setAvatarModalVisible(false);
  };

  const openImagePicker = () => {
    Alert.alert(
      '選擇頭像',
      '請選擇頭像來源',
      [
        { text: '相機', onPress: takePhoto },
        { text: '相簿', onPress: pickImage },
        { text: '移除自定義頭像', onPress: removeCustomAvatar },
        { text: '取消', style: 'cancel' }
      ]
    );
    setAvatarModalVisible(false);
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('需要權限', '請允許使用相機');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        saveUserProfile({ avatar: result.assets[0].uri });
      }
    } catch (error) {
      console.error('拍照錯誤:', error);
      Alert.alert('錯誤', '拍照失敗');
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('需要權限', '請允許訪問相簿');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        saveUserProfile({ avatar: result.assets[0].uri });
      }
    } catch (error) {
      console.error('選擇照片錯誤:', error);
      Alert.alert('錯誤', '選擇照片失敗');
    }
  };

  const removeCustomAvatar = () => {
    saveUserProfile({ avatar: 'account-circle' });
    Alert.alert('成功', '已恢復為預設頭像');
  };

  // 渲染頭像
  const renderAvatar = () => (
    <TouchableOpacity style={styles.avatarContainer} onPress={openAvatarOptions}>
      {userProfile.avatar && userProfile.avatar.startsWith('file://') ? (
        <Image source={{ uri: userProfile.avatar }} style={styles.avatarImage} />
      ) : (
        <MaterialCommunityIcons 
          name={userProfile.avatar || 'account-circle'} 
          size={80} 
          color="#00CED1" 
        />
      )}
      <View style={styles.editAvatarIcon}>
        <MaterialCommunityIcons name="camera" size={16} color="#ffffff" />
      </View>
    </TouchableOpacity>
  );

  // 渲染資訊卡片
  const renderInfoCard = (title, value, icon, onPress) => (
    <TouchableOpacity style={styles.infoCard} onPress={onPress}>
      <View style={styles.cardLeft}>
        <MaterialCommunityIcons name={icon} size={24} color="#00CED1" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardValue}>{value}</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#A9A9A9" />
      </View>
    </TouchableOpacity>
  );

  // 渲染編輯彈窗
  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>編輯{getEditTitle(editType)}</Text>
          
          {editType === 'goal' ? (
            <View style={styles.goalOptions}>
              {goalOptions.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.goalOption,
                    editValue === goal && styles.selectedGoalOption
                  ]}
                  onPress={() => setEditValue(goal)}
                >
                  <Text style={[
                    styles.goalOptionText,
                    editValue === goal && styles.selectedGoalOptionText
                  ]}>
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`請輸入${getEditTitle(editType)}`}
              placeholderTextColor="#A9A9A9"
              keyboardType={
                editType === 'height' || editType === 'weight' || editType === 'age' 
                  ? 'numeric' 
                  : 'default'
              }
            />
          )}
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // 渲染頭像選擇彈窗
  const renderAvatarModal = () => (
    <Modal
      visible={avatarModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setAvatarModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>選擇頭像</Text>
          
          <View style={styles.avatarGrid}>
            {avatarOptions.map((avatar) => (
              <TouchableOpacity
                key={avatar}
                style={styles.avatarOption}
                onPress={() => selectSystemAvatar(avatar)}
              >
                <MaterialCommunityIcons name={avatar} size={40} color="#00CED1" />
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.customAvatarButton} onPress={openImagePicker}>
            <MaterialCommunityIcons name="camera" size={20} color="#ffffff" />
            <Text style={styles.customAvatarText}>自定義頭像</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => setAvatarModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const getEditTitle = (type) => {
    const titles = {
      name: '姓名',
      height: '身高',
      weight: '體重',
      age: '年齡',
      goal: '健身目標'
    };
    return titles[type] || '';
  };

  const getCardValue = (type) => {
    const values = {
      height: `${userProfile.height} cm`,
      weight: `${userProfile.weight} kg`,
      age: `${userProfile.age} 歲`,
      goal: userProfile.goal
    };
    return values[type] || userProfile[type];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      
      {/* 標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>個人檔案</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 頂部用戶區域 */}
        <View style={styles.profileHeader}>
          {renderAvatar()}
          <Text style={styles.userName}>{userProfile.name}</Text>
          <View style={styles.joinInfo}>
            <MaterialCommunityIcons name="calendar" size={16} color="#A9A9A9" />
            <Text style={styles.joinText}>加入於 {userProfile.joinDate}</Text>
          </View>
        </View>

        {/* 基本資料卡片 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本資料</Text>
          
          {renderInfoCard(
            '姓名', 
            userProfile.name, 
            'account', 
            () => handleEdit('name', userProfile.name)
          )}
          
          {renderInfoCard(
            '身高', 
            getCardValue('height'), 
            'human-male-height', 
            () => handleEdit('height', userProfile.height)
          )}
          
          {renderInfoCard(
            '體重', 
            getCardValue('weight'), 
            'weight', 
            () => handleEdit('weight', userProfile.weight)
          )}
          
          {renderInfoCard(
            '年齡', 
            getCardValue('age'), 
            'cake-variant', 
            () => handleEdit('age', userProfile.age)
          )}
          
          {renderInfoCard(
            '健身目標', 
            userProfile.goal, 
            'target', 
            () => handleEdit('goal', userProfile.goal)
          )}
        </View>

        {/* 功能選單 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>功能選單</Text>
          
          {renderInfoCard(
            '綁定', 
            '帳號綁定服務', 
            'link', 
            () => Alert.alert('提示', '綁定功能開發中')
          )}
        </View>
      </ScrollView>

      {renderEditModal()}
      {renderAvatarModal()}
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
    borderBottomColor: '#2E3A3B',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // 個人資料頭部
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3A3B',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00CED1',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  joinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  joinText: {
    fontSize: 14,
    color: '#A9A9A9',
  },

  // 區塊樣式
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },

  // 資訊卡片
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardValue: {
    fontSize: 16,
    color: '#A9A9A9',
  },

  // 彈窗樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2E3A3B',
    borderRadius: 16,
    padding: 20,
    width: screenWidth * 0.9,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  editInput: {
    backgroundColor: '#1C2526',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#4A5657',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00CED1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 目標選擇
  goalOptions: {
    marginBottom: 20,
  },
  goalOption: {
    backgroundColor: '#1C2526',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  selectedGoalOption: {
    borderColor: '#00CED1',
    backgroundColor: '#00CED1',
  },
  goalOptionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedGoalOptionText: {
    fontWeight: 'bold',
  },

  // 頭像選擇
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  avatarOption: {
    width: 60,
    height: 60,
    backgroundColor: '#1C2526',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4A5657',
  },
  customAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00CED1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  customAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 