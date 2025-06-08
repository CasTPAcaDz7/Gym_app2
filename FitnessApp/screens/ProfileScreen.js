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

// 香港地區數據
const HONG_KONG_DISTRICTS = {
  '香港島': [
    '中西區', '灣仔區', '東區', '南區'
  ],
  '九龍': [
    '油尖旺區', '深水埗區', '九龍城區', '黃大仙區', '觀塘區'
  ],
  '新界': [
    '葵青區', '荃灣區', '屯門區', '元朗區', '北區', '大埔區', '沙田區', '西貢區', '離島區'
  ]
};
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

export default function ProfileScreen({ navigation, route }) {
  const mode = route?.params?.mode || 'student';
  const [isEditMode, setIsEditMode] = useState(true); // 總是從編輯模式開始
  
  const [studentProfile, setStudentProfile] = useState({
    name: '王小明',
    avatar: 'account-circle',
    photos: [],
    height: 170,
    weight: 65,
    age: 25,
    goal: '減重',
    location: '香港',
    bio: '我是一個健身愛好者，希望能夠保持健康的生活方式。',
    joinDate: '2024-01-01',
  });
  
  const [coachProfile, setCoachProfile] = useState({
    name: '李教練',
    avatar: 'account-tie',
    photos: [],
    height: 175,
    weight: 75,
    age: 30,
    goal: '專業指導',
    location: '九龍城',
    bio: '專業健身教練，專注於重量訓練和體能提升，擁有5年豐富教學經驗。',
    joinDate: '2023-06-01',
    specialties: ['重量訓練', '有氧運動', '營養指導'],
    certification: 'ACSM認證',
    experience: '5年教練經驗',
    zodiac: '獅子座',
    tags: ['重量訓練', '營養指導', '體能提升'],
    // 新增的教練專業欄位
    teachingAreas: ['九龍城區', '觀塘區', '沙田區'],
    professionalCertificates: 'ACSM認證健身教練、NASM-CPT個人訓練師認證',
    workExperience: '5年專業健身教練經驗，曾在知名健身中心擔任首席教練',
    educationBackground: '體育科學學士、運動生理學碩士',
    languageSkills: '粵語（母語）、普通話（流利）、英語（良好）',
    achievements: '2022年最佳健身教練獎、培訓學員超過200名、減重成功率95%',
  });
  
  // 根據模式獲取當前的個人資料
  const getCurrentProfile = () => {
    return mode === 'coach' ? coachProfile : studentProfile;
  };
  
  // 根據模式設定當前的個人資料
  const setCurrentProfile = (newData) => {
    if (mode === 'coach') {
      setCoachProfile(prev => ({ ...prev, ...newData }));
    } else {
      setStudentProfile(prev => ({ ...prev, ...newData }));
    }
  };

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState('');
  const [editValue, setEditValue] = useState('');
  
  // 用戶名編輯相關狀態
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  // 地區選擇相關狀態
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]); // 改為數組，支持多選地區
  const [selectedDistricts, setSelectedDistricts] = useState([]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      if (mode === 'coach') {
        const coachData = await AsyncStorage.getItem('coachProfile');
        if (coachData) {
          const parsedData = JSON.parse(coachData);
          setCoachProfile(prevData => ({
          ...prevData,
          ...parsedData
        }));
        }
      } else {
        const studentData = await AsyncStorage.getItem('studentProfile');
        if (studentData) {
          const parsedData = JSON.parse(studentData);
          setStudentProfile(prevData => ({
            ...prevData,
            ...parsedData
          }));
        } else {
          const legacyData = await AsyncStorage.getItem('userProfile');
          if (legacyData) {
            const parsedLegacyData = JSON.parse(legacyData);
            setStudentProfile(prevData => ({
              ...prevData,
              ...parsedLegacyData
            }));
          }
        }
      }
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    }
  };

  const saveUserProfile = async (newData) => {
    try {
      if (mode === 'coach') {
        const updatedProfile = { ...coachProfile, ...newData };
        await AsyncStorage.setItem('coachProfile', JSON.stringify(updatedProfile));
        setCoachProfile(updatedProfile);
      } else {
        const updatedProfile = { ...studentProfile, ...newData };
        await AsyncStorage.setItem('studentProfile', JSON.stringify(updatedProfile));
        setStudentProfile(updatedProfile);
      }
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

  // 處理地區選擇
  const handleDistrictSelection = () => {
    const profile = getCurrentProfile();
    setSelectedDistricts(profile.teachingAreas || []);
    // 根據已選地區設定已選大區域
    const currentDistricts = profile.teachingAreas || [];
    const currentRegions = [];
    Object.entries(HONG_KONG_DISTRICTS).forEach(([region, districts]) => {
      if (districts.some(district => currentDistricts.includes(district))) {
        currentRegions.push(region);
      }
    });
    setSelectedRegions(currentRegions);
    setDistrictModalVisible(true);
  };

  // 處理大區域選擇切換
  const toggleRegion = (region) => {
    setSelectedRegions(prev => {
      if (prev.includes(region)) {
        // 取消選擇主要地區時，也要取消該地區下的所有已選地區
        const districtsInRegion = HONG_KONG_DISTRICTS[region] || [];
        setSelectedDistricts(prevDistricts => 
          prevDistricts.filter(district => !districtsInRegion.includes(district))
        );
        return prev.filter(r => r !== region);
      } else {
        return [...prev, region];
      }
    });
  };

  // 處理地區勾選/取消勾選
  const toggleDistrict = (district) => {
    setSelectedDistricts(prev => {
      if (prev.includes(district)) {
        return prev.filter(d => d !== district);
      } else {
        return [...prev, district];
      }
    });
  };

  // 切換全選/全取消功能
  const selectAllDistricts = () => {
    const allDistricts = Object.values(HONG_KONG_DISTRICTS).flat();
    const allRegions = Object.keys(HONG_KONG_DISTRICTS);
    
    // 檢查是否已經全選
    const isAllSelected = allDistricts.length === selectedDistricts.length && 
                         allDistricts.every(district => selectedDistricts.includes(district));
    
    if (isAllSelected) {
      // 如果已經全選，則全取消
      setSelectedDistricts([]);
      setSelectedRegions([]);
    } else {
      // 如果沒有全選，則全選
      setSelectedDistricts(allDistricts);
      setSelectedRegions(allRegions);
    }
  };

  // 保存地區選擇
  const saveDistrictSelection = () => {
    const profile = getCurrentProfile();
    const updatedProfile = { ...profile, teachingAreas: selectedDistricts };
    
    if (mode === 'coach') {
      setCoachProfile(updatedProfile);
    } else {
      setUserProfile(updatedProfile);
    }
    
    setDistrictModalVisible(false);
    saveUserProfile({ teachingAreas: selectedDistricts });
  };

  // 添加照片
  const addPhoto = () => {
    navigation.navigate('PhotoCrop', {
      onPhotoSelect: (croppedPhotoUri) => {
        const currentPhotos = getCurrentProfile().photos || [];
        const newPhotos = [...currentPhotos, croppedPhotoUri];
        saveUserProfile({ photos: newPhotos });
      }
    });
  };

  // 移除照片
  const removePhoto = (index) => {
    const currentPhotos = getCurrentProfile().photos || [];
    const newPhotos = currentPhotos.filter((_, i) => i !== index);
    saveUserProfile({ photos: newPhotos });
  };

  // 處理用戶名編輯
  const handleStartEditName = () => {
    const profile = getCurrentProfile();
    setTempName(profile.name);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (!tempName.trim()) {
      Alert.alert('錯誤', '用戶名不能為空');
      return;
    }
    saveUserProfile({ name: tempName.trim() });
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setTempName('');
  };

  // 生成用戶ID
  const generateUserId = () => {
    const profile = getCurrentProfile();
    const prefix = mode === 'coach' ? 'C' : 'S';
    const baseString = profile.name + (profile.joinDate || '2024-01-01');
    // 簡單的哈希函數生成固定ID
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 轉換為32位整數
    }
    return `${prefix}${Math.abs(hash).toString().slice(0, 8)}`;
  };

  // 渲染編輯/預覽切換
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity 
        style={[styles.tab, isEditMode && styles.activeTab]}
        onPress={() => setIsEditMode(true)}
      >
        <Text style={[styles.tabText, isEditMode && styles.activeTabText]}>編輯</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, !isEditMode && styles.activeTab]}
        onPress={() => setIsEditMode(false)}
      >
        <Text style={[styles.tabText, !isEditMode && styles.activeTabText]}>預覽</Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染照片區域
  const renderPhotosSection = () => {
    const photos = getCurrentProfile().photos || [];
    
    if (!isEditMode && photos.length > 0) {
      // 預覽模式：顯示第一張照片全屏
      return (
        <View style={styles.previewPhotoContainer}>
          <Image source={{ uri: photos[0] }} style={styles.previewPhoto} />
          {photos.length > 1 && (
            <View style={styles.photoCounter}>
              <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
              <Text style={styles.photoCountText}>{photos.length}</Text>
            </View>
          )}
        </View>
      );
    }

    if (isEditMode) {
      // 編輯模式：顯示照片網格
      return (
        <View style={styles.editPhotosContainer}>
          <View style={styles.photosHeader}>
            <View style={styles.photosTitleContainer}>
              <View style={styles.redDot} />
              <Text style={styles.photosTitle}>相片</Text>
            </View>
            <Text style={styles.photosBonus}>+ 10%</Text>
          </View>
          
          <View style={styles.photosGrid}>
            {Array.from({ length: 6 }, (_, index) => {
              const photo = photos[index];
              if (photo) {
                // 顯示已上傳的照片
                return (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    <TouchableOpacity 
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <MaterialCommunityIcons name="close-circle" size={24} color="#00FF00" />
                    </TouchableOpacity>
                  </View>
                );
              } else {
                // 顯示添加按鈕
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.addPhotoButton} 
                    onPress={addPhoto}
                  >
                    <MaterialCommunityIcons name="plus" size={28} color="#999999" />
                  </TouchableOpacity>
                );
              }
            })}
          </View>
        </View>
      );
    }

    return null;
  };

  // 渲染標籤區域
  const renderTagsSection = () => {
    return null;
  };

  // 渲染用戶名編輯區域（僅編輯模式顯示）
  const renderUserNameSection = () => {
    if (!isEditMode) {
      return null;
    }

    const profile = getCurrentProfile();
    const userId = generateUserId();

    return (
      <View style={styles.userNameContainer}>
        {/* 用戶名編輯區域 */}
        <View style={styles.nameEditSection}>
          <Text style={styles.nameLabel}>用戶名稱</Text>
          {isEditingName ? (
            <View style={styles.nameEditBox}>
              <TextInput
                style={styles.nameInput}
                value={tempName}
                onChangeText={setTempName}
                placeholder="請輸入用戶名稱"
                placeholderTextColor="#A9A9A9"
                autoFocus={true}
              />
              <View style={styles.nameEditButtons}>
                <TouchableOpacity
                  style={styles.nameCancelButton}
                  onPress={handleCancelEditName}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nameSaveButton}
                  onPress={handleSaveName}
                >
                  <MaterialCommunityIcons name="check" size={18} color="#00CED1" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.nameDisplayBox}
              onPress={handleStartEditName}
            >
              <Text style={styles.nameDisplayText}>{profile.name}</Text>
              <MaterialCommunityIcons name="pencil" size={20} color="#A9A9A9" />
            </TouchableOpacity>
          )}
        </View>

        {/* 用戶ID顯示區域 */}
        <View style={styles.userIdSection}>
          <Text style={styles.userIdLabel}>用戶ID</Text>
          <View style={styles.userIdDisplayBox}>
            <Text style={styles.userIdText}>{userId}</Text>
            <MaterialCommunityIcons name="identifier" size={18} color="#A9A9A9" />
          </View>
        </View>
      </View>
    );
  };

  // 渲染關於我區域
  const renderAboutSection = () => {
    const profile = getCurrentProfile();
    
         if (!isEditMode) {
       // 預覽模式：僅顯示簡介
       return (
         <View style={styles.previewAboutContainer}>
           <Text style={styles.previewBio}>{profile.bio}</Text>
      </View>
       );
     }

    // 編輯模式：顯示編輯界面
    return (
      <View style={styles.aboutContainer}>
        <Text style={styles.aboutTitle}>關於我</Text>
        <TouchableOpacity 
          style={styles.bioContainer}
          onPress={() => handleEdit('bio', profile.bio)}
        >
          <Text style={styles.bioText}>{profile.bio}</Text>
          <MaterialCommunityIcons name="pencil" size={20} color="#A9A9A9" />
        </TouchableOpacity>
      </View>
  );
  };

  // 渲染基本資訊區域（教授區域和語言能力）
  const renderBasicInfoSection = () => {
    if (mode !== 'coach' || !isEditMode) {
      return null;
    }
    
    const profile = getCurrentProfile();
    
    const basicInfoFields = [
      { key: 'teachingAreas', title: '教授地區', icon: 'map-marker-outline' },
      { key: 'languageSkills', title: '語言能力', icon: 'translate' },
    ];

    return (
      <View style={styles.basicInfoContainer}>
        {basicInfoFields.map((field) => (
          <TouchableOpacity 
            key={field.key}
            style={styles.basicInfoItem}
            onPress={() => {
              if (field.key === 'teachingAreas') {
                handleDistrictSelection();
              } else {
                handleEdit(field.key, profile[field.key] || '');
              }
            }}
          >
            <View style={styles.basicInfoLeft}>
              <MaterialCommunityIcons 
                name={field.icon} 
                size={20} 
                color="#00CED1" 
                style={styles.basicInfoIcon}
              />
              <View style={styles.basicInfoContent}>
                <Text style={styles.basicInfoLabel}>{field.title}</Text>
                <Text style={styles.basicInfoValue} numberOfLines={2}>
                  {field.key === 'teachingAreas' 
                    ? (Array.isArray(profile[field.key]) && profile[field.key].length > 0 
                        ? profile[field.key].join('、') 
                        : '點擊選擇地區')
                    : (profile[field.key] || '點擊設定')
                  }
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="pencil" size={20} color="#A9A9A9" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 渲染教練專業資訊區域（僅教練模式顯示）
  const renderCoachProfessionalSection = () => {
    if (mode !== 'coach' || !isEditMode) {
      return null;
    }
    
    const profile = getCurrentProfile();
    
    const professionalFields = [
      { key: 'professionalCertificates', title: '專業證書', icon: 'certificate-outline' },
      { key: 'workExperience', title: '工作經驗', icon: 'briefcase-outline' },
      { key: 'educationBackground', title: '相關教育背景', icon: 'school-outline' },
      { key: 'achievements', title: '相關成就', icon: 'trophy-outline' },
    ];

    return (
      <View style={styles.professionalContainer}>
        <Text style={styles.professionalTitle}>專業資訊</Text>
        {professionalFields.map((field) => (
          <TouchableOpacity 
            key={field.key}
            style={styles.professionalItem}
            onPress={() => handleEdit(field.key, profile[field.key] || '')}
          >
            <View style={styles.professionalLeft}>
              <MaterialCommunityIcons 
                name={field.icon} 
                size={20} 
                color="#00CED1" 
                style={styles.professionalIcon}
              />
              <View style={styles.professionalContent}>
                <Text style={styles.professionalLabel}>{field.title}</Text>
                <Text style={styles.professionalValue} numberOfLines={2}>
                  {profile[field.key] || '點擊設定'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="pencil" size={20} color="#A9A9A9" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 渲染編輯彈窗
  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>編輯{getEditTitle(editType)}</Text>
          
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`請輸入${getEditTitle(editType)}`}
              placeholderTextColor="#A9A9A9"
              multiline={editType === 'bio' || editType === 'professionalCertificates' || editType === 'workExperience' || editType === 'educationBackground' || editType === 'languageSkills' || editType === 'achievements'}
              numberOfLines={editType === 'bio' || editType === 'professionalCertificates' || editType === 'workExperience' || editType === 'educationBackground' || editType === 'languageSkills' || editType === 'achievements' ? 4 : 1}
            />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEdit}
            >
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // 渲染地區選擇彈窗
  const renderDistrictModal = () => {
    // 計算是否已經全選
    const allDistricts = Object.values(HONG_KONG_DISTRICTS).flat();
    const isAllSelected = allDistricts.length === selectedDistricts.length && 
                         allDistricts.every(district => selectedDistricts.includes(district));
    
    return (
      <Modal
        visible={districtModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDistrictModalVisible(false)}
      >
        <View style={styles.modernModalOverlay}>
          <View style={styles.modernDistrictModalContent}>
            {/* 現代化標題欄 */}
            <View style={styles.modernDistrictModalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setDistrictModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666666" />
              </TouchableOpacity>
              <Text style={styles.modernDistrictModalTitle}>選擇教授地區</Text>
              <TouchableOpacity 
                style={styles.modernSelectAllButton}
                onPress={selectAllDistricts}
              >
                <MaterialCommunityIcons 
                  name={isAllSelected ? "checkbox-marked" : "select-all"} 
                  size={20} 
                  color="#00CED1" 
                />
                <Text style={styles.modernSelectAllButtonText}>
                  {isAllSelected ? "全取消" : "全選"}
                </Text>
              </TouchableOpacity>
            </View>

          {/* 已選地區數量指示器 */}
          <View style={styles.selectionIndicator}>
            <View style={styles.indicatorDot} />
            <Text style={styles.selectionCount}>已選擇 {selectedDistricts.length} 個地區</Text>
          </View>

          {/* 主要內容區域 */}
          <View style={styles.modernDistrictMainContent}>
            {/* 左側大區域選擇 (30%) */}
            <View style={styles.modernRegionSelectionPanel}>
              <Text style={styles.modernRegionPanelTitle}>主要地區</Text>
              {Object.keys(HONG_KONG_DISTRICTS).map((region, index) => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.modernRegionSelectionItem,
                    selectedRegions.includes(region) && styles.modernRegionSelectionItemSelected
                  ]}
                  onPress={() => toggleRegion(region)}
                >
                  <View style={styles.regionItemContent}>
                    <Text style={[
                      styles.modernRegionSelectionText,
                      selectedRegions.includes(region) && styles.modernRegionSelectionTextSelected
                    ]}>
                      {region}
                    </Text>
                  </View>
                  <View style={[
                    styles.modernRegionCheckbox,
                    selectedRegions.includes(region) && styles.modernRegionCheckboxSelected
                  ]}>
                    {selectedRegions.includes(region) && (
                      <MaterialCommunityIcons 
                        name="check" 
                        size={14} 
                        color="#FFFFFF" 
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* 右側18區顯示 (70%) */}
            <View style={styles.modernDistrictsDisplayPanel}>
              <Text style={styles.modernDistrictsPanelTitle}>選擇區域</Text>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                style={styles.districtsScrollView}
              >
                {Object.entries(HONG_KONG_DISTRICTS).map(([region, districts]) => (
                  <View key={region} style={styles.modernRegionDistrictsGroup}>
                    <View style={styles.regionHeaderContainer}>
                      <View style={[
                        styles.regionHeaderIndicator,
                        selectedRegions.includes(region) && styles.regionHeaderIndicatorActive
                      ]} />
                      <Text style={[
                        styles.modernRegionGroupTitle,
                        !selectedRegions.includes(region) && styles.modernRegionGroupTitleDisabled
                      ]}>
                        {region}
                      </Text>
                      <Text style={[
                        styles.regionDistrictCount,
                        !selectedRegions.includes(region) && styles.regionDistrictCountDisabled
                      ]}>
                        {districts.filter(d => selectedDistricts.includes(d)).length}/{districts.length}
                      </Text>
                    </View>
                    <View style={styles.modernDistrictsGrid}>
                      {districts.map((district) => (
                        <TouchableOpacity
                          key={district}
                          style={[
                            styles.modernDistrictGridItem,
                            selectedDistricts.includes(district) && styles.modernDistrictGridItemSelected,
                            !selectedRegions.includes(region) && styles.modernDistrictGridItemDisabled
                          ]}
                          onPress={() => {
                            if (selectedRegions.includes(region)) {
                              toggleDistrict(district);
                            }
                          }}
                          disabled={!selectedRegions.includes(region)}
                        >
                          <Text style={[
                            styles.modernDistrictGridText,
                            selectedDistricts.includes(district) && styles.modernDistrictGridTextSelected,
                            !selectedRegions.includes(region) && styles.modernDistrictGridTextDisabled
                          ]}>
                            {district}
                          </Text>
                          {selectedDistricts.includes(district) && (
                            <View style={styles.districtSelectedIndicator}>
                              <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* 現代化底部按鈕 */}
          <View style={styles.modernDistrictModalButtons}>
            <TouchableOpacity 
              style={styles.modernCancelButton} 
              onPress={() => setDistrictModalVisible(false)}
            >
              <Text style={styles.modernCancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modernSaveButton,
                selectedDistricts.length === 0 && styles.modernSaveButtonDisabled
              ]}
              onPress={saveDistrictSelection}
              disabled={selectedDistricts.length === 0}
            >
              <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
              <Text style={styles.modernSaveButtonText}>
                確認選擇 {selectedDistricts.length > 0 && `(${selectedDistricts.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    );
  };

  const getEditTitle = (type) => {
    const titles = {
      name: '姓名',
      bio: '個人簡介',
      location: '位置',
      height: '身高',
      weight: '體重',
      age: '年齡',
      // 教練專業欄位
      teachingAreas: '教授地區',
      professionalCertificates: '專業證書',
      workExperience: '工作經驗',
      educationBackground: '相關教育背景',
      languageSkills: '語言能力',
      achievements: '相關成就',
    };
    return titles[type] || type;
  };

  // 渲染Instagram風格教練預覽卡片
  const renderCoachPreviewCard = () => {
    const profile = getCurrentProfile();
    const photos = profile.photos || [];
    
    return (
      <View style={styles.previewCardContainer}>
        {/* 背景照片容器 */}
        <View style={styles.previewPhotoBackground}>
          {photos.length > 0 ? (
            <Image source={{ uri: photos[0] }} style={styles.previewBackgroundImage} />
          ) : (
            <View style={styles.noPhotoBackground}>
              <MaterialCommunityIcons name="account-circle" size={120} color="#666666" />
            </View>
          )}
          
          {/* 漸層遮罩 */}
          <View style={styles.previewGradientOverlay} />
          
          {/* 照片數量指示器 */}
          {photos.length > 1 && (
            <View style={styles.previewPhotoCounter}>
              <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
              <Text style={styles.previewPhotoCountText}>{photos.length}</Text>
            </View>
          )}
        </View>

        {/* 內容區域 */}
        <View style={styles.previewContentContainer}>
          {/* 教練姓名和年齡 */}
          <View style={styles.previewHeader}>
            <Text style={styles.previewName}>{profile.name}</Text>
            <Text style={styles.previewAge}>{profile.age}歲</Text>
          </View>

          {/* 專業領域標籤 */}
          {profile.specialties && profile.specialties.length > 0 && (
            <View style={styles.previewSpecialtiesContainer}>
              {profile.specialties.slice(0, 3).map((specialty, index) => (
                <View key={index} style={styles.previewSpecialtyTag}>
                  <Text style={styles.previewSpecialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 教練簡介 */}
          <Text style={styles.previewBio} numberOfLines={3}>
            {profile.bio}
          </Text>

          {/* 詳細信息 */}
          <View style={styles.previewDetailsContainer}>
            {profile.teachingAreas && profile.teachingAreas.length > 0 && (
              <View style={styles.previewDetailItem}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#00CED1" />
                <Text style={styles.previewDetailText}>
                  {profile.teachingAreas.slice(0, 2).join('、')}
                  {profile.teachingAreas.length > 2 && '...'}
                </Text>
              </View>
            )}
            <View style={styles.previewDetailItem}>
              <MaterialCommunityIcons name="certificate" size={16} color="#00CED1" />
              <Text style={styles.previewDetailText}>{profile.certification || '認證教練'}</Text>
            </View>
            <View style={styles.previewDetailItem}>
              <MaterialCommunityIcons name="clock" size={16} color="#00CED1" />
              <Text style={styles.previewDetailText}>{profile.experience || '專業經驗'}</Text>
            </View>
          </View>

          {/* 底部操作區 */}
          <View style={styles.previewActionContainer}>
            <View style={styles.previewPriceContainer}>
              <Text style={styles.previewPriceText}>$500/小時</Text>
            </View>
            <View style={styles.previewActionButtons}>
              <TouchableOpacity style={styles.previewViewProfileButton}>
                <MaterialCommunityIcons name="account-details" size={20} color="#00CED1" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.previewContactButton}>
                <MaterialCommunityIcons name="message" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      
      {/* 標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'coach' ? '教練檔案' : '個人檔案'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('CommunityMain', { preserveMode: mode })}>
          <MaterialCommunityIcons name="check" size={24} color="#00CED1" />
        </TouchableOpacity>
      </View>

      {/* 根據模式和狀態顯示不同內容 */}
      {mode === 'coach' && !isEditMode ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderTabBar()}
          {renderCoachPreviewCard()}
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderTabBar()}
          {renderPhotosSection()}
          {renderTagsSection()}
          {renderUserNameSection()}
          {renderAboutSection()}
          {renderBasicInfoSection()}
          {renderCoachProfessionalSection()}
        </ScrollView>
      )}

      {renderEditModal()}
      {renderDistrictModal()}
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
  scrollView: {
    flex: 1,
  },

  // 標籤欄
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2E3A3B',
  },
  activeTab: {
    borderBottomColor: '#00CED1',
  },
  tabText: {
    fontSize: 16,
    color: '#A9A9A9',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#00CED1',
  },

  // 編輯模式照片
  editPhotosContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  photosTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  photosTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  photosBonus: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItem: {
    position: 'relative',
    width: (screenWidth - 50) / 3,
    height: (screenWidth - 50) / 3 * (10/7),
    marginBottom: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'transparent',
    borderRadius: 12,
    zIndex: 1,
  },
  addPhotoButton: {
    width: (screenWidth - 50) / 3,
    height: (screenWidth - 50) / 3 * (10/7),
    backgroundColor: 'transparent',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A9A9A9',
    borderStyle: 'dashed',
    marginBottom: 8,
  },

     // 預覽模式照片
   previewPhotoContainer: {
     position: 'relative',
     height: screenWidth * (10/7),
     marginBottom: 20,
   },
  previewPhoto: {
    width: '100%',
    height: '100%',
  },
  photoCounter: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  

  // 用戶名編輯區域樣式
  userNameContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  nameEditSection: {
    marginBottom: 16,
  },
  nameLabel: {
    fontSize: 14,
    color: '#00CED1',
    fontWeight: '500',
    marginBottom: 8,
  },
  nameEditBox: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 4,
  },
  nameEditButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  nameCancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A5657',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameSaveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00CED1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameDisplayBox: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameDisplayText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  userIdSection: {
    marginBottom: 8,
  },
  userIdLabel: {
    fontSize: 14,
    color: '#A9A9A9',
    fontWeight: '500',
    marginBottom: 8,
  },
  userIdDisplayBox: {
    backgroundColor: '#1C2526',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3E4A4B',
  },
  userIdText: {
    fontSize: 14,
    color: '#A9A9A9',
    fontFamily: 'monospace',
    flex: 1,
  },

  // 關於我區域
  aboutContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  aboutTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 15,
  },
  bioContainer: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bioText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },

     // 預覽模式關於我
   previewAboutContainer: {
     paddingHorizontal: 20,
     paddingBottom: 30,
  },
  previewBio: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
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
    textAlignVertical: 'top',
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
  saveButton: {
    flex: 1,
    backgroundColor: '#00CED1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // 基本資訊區域樣式
  basicInfoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  basicInfoItem: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  basicInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  basicInfoIcon: {
    marginRight: 12,
  },
  basicInfoContent: {
    flex: 1,
  },
  basicInfoLabel: {
    fontSize: 14,
    color: '#00CED1',
    fontWeight: '500',
    marginBottom: 4,
  },
  basicInfoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 18,
  },

  // 專業資訊區域樣式
  professionalContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  professionalTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 15,
  },
  professionalItem: {
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  professionalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  professionalIcon: {
    marginRight: 12,
  },
  professionalContent: {
    flex: 1,
  },
  professionalLabel: {
    fontSize: 14,
    color: '#00CED1',
    fontWeight: '500',
    marginBottom: 4,
  },
  professionalValue: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 18,
  },

  // 地區選擇彈窗樣式
  districtModalContent: {
    backgroundColor: '#2E3A3B',
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  newDistrictModalContent: {
    backgroundColor: '#2E3A3B',
    margin: 20,
    borderRadius: 16,
    height: '80%',
    width: '90%',
  },
  districtModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3E4A4B',
  },
  districtModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectAllButton: {
    backgroundColor: '#00CED1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  selectAllButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  districtScrollView: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  regionContainer: {
    marginBottom: 16,
  },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C2526',
    padding: 16,
    borderRadius: 12,
  },
  regionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00CED1',
  },
  districtsContainer: {
    marginTop: 8,
    backgroundColor: '#252F30',
    borderRadius: 12,
    overflow: 'hidden',
  },
  districtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3E4A4B',
  },
  districtText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  districtModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    paddingHorizontal: 20,
    gap: 12,
  },

  // 現代化樣式
  modernModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modernDistrictModalContent: {
    backgroundColor: '#2E3A3B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },

  // 現代化標題欄
  modernDistrictModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3E4A4B',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C2526',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernDistrictModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  modernSelectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 206, 209, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  modernSelectAllButtonText: {
    color: '#00CED1',
    fontSize: 14,
    fontWeight: '600',
  },

  // 選擇指示器
  selectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1C2526',
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00CED1',
  },
  selectionCount: {
    fontSize: 14,
    color: '#A9A9A9',
    fontWeight: '500',
  },

  // 主要內容區域
  modernDistrictMainContent: {
    flexDirection: 'row',
    flex: 1,
    paddingTop: 20,
  },
  
  // 左側大區域選擇面板 (30%)
  modernRegionSelectionPanel: {
    width: '30%',
    paddingLeft: 24,
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#3E4A4B',
  },
  modernRegionPanelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  modernRegionSelectionItem: {
    backgroundColor: '#1C2526',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernRegionSelectionItemSelected: {
    backgroundColor: '#00CED1',
    borderColor: '#00B8C4',
    shadowColor: '#00CED1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  regionItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modernRegionSelectionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  modernRegionSelectionTextSelected: {
    color: '#FFFFFF',
  },
  modernRegionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A9A9A9',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  modernRegionCheckboxSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  // 右側18區顯示面板 (70%)
  modernDistrictsDisplayPanel: {
    width: '70%',
    paddingLeft: 16,
    paddingRight: 24,
  },
  modernDistrictsPanelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  districtsScrollView: {
    flex: 1,
  },
  modernRegionDistrictsGroup: {
    marginBottom: 24,
  },
  regionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  regionHeaderIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#3E4A4B',
  },
  regionHeaderIndicatorActive: {
    backgroundColor: '#00CED1',
  },
  modernRegionGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.2,
  },
  modernRegionGroupTitleDisabled: {
    color: '#666666',
  },
  regionDistrictCount: {
    fontSize: 12,
    color: '#A9A9A9',
    fontWeight: '500',
    backgroundColor: '#1C2526',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  regionDistrictCountDisabled: {
    color: '#666666',
  },
  modernDistrictsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modernDistrictGridItem: {
    backgroundColor: '#1C2526',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    minWidth: '28%',
    borderWidth: 1,
    borderColor: '#3E4A4B',
    position: 'relative',
  },
  modernDistrictGridItemSelected: {
    backgroundColor: '#00CED1',
    borderColor: '#00B8C4',
    shadowColor: '#00CED1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modernDistrictGridItemDisabled: {
    backgroundColor: '#0D1314',
    borderColor: '#3E4A4B',
    opacity: 0.6,
  },
  modernDistrictGridText: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  modernDistrictGridTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modernDistrictGridTextDisabled: {
    color: '#666666',
  },
  districtSelectedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 現代化底部按鈕
  modernDistrictModalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#3E4A4B',
  },
  modernCancelButton: {
    flex: 1,
    backgroundColor: '#1C2526',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3E4A4B',
  },
  modernCancelButtonText: {
    color: '#A9A9A9',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  modernSaveButton: {
    flex: 2,
    backgroundColor: '#00CED1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#00CED1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modernSaveButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  modernSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Instagram風格教練預覽卡片樣式
  previewCardContainer: {
    backgroundColor: '#2E3A3B',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  previewPhotoBackground: {
    height: screenWidth * 0.75,
    position: 'relative',
  },
  previewBackgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noPhotoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C2526',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  previewPhotoCounter: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  previewPhotoCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  previewContentContainer: {
    padding: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  previewAge: {
    fontSize: 16,
    color: '#A9A9A9',
    fontWeight: '500',
  },
  previewSpecialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  previewSpecialtyTag: {
    backgroundColor: '#00CED1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  previewSpecialtyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  previewBio: {
    fontSize: 16,
    color: '#E5E5E5',
    lineHeight: 24,
    marginBottom: 20,
  },
  previewDetailsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  previewDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewDetailText: {
    fontSize: 14,
    color: '#C0C0C0',
    flex: 1,
  },
  previewActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewPriceContainer: {
    flex: 1,
  },
  previewPriceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00CED1',
  },
  previewActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  previewViewProfileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 206, 209, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00CED1',
  },
  previewContactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00CED1',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 