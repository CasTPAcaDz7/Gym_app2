import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Animated,
  LayoutAnimation,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 香港地區數據
const HONG_KONG_DISTRICTS = {
  '香港島': ['中西區', '灣仔區', '東區', '南區'],
  '九龍': ['油尖旺區', '深水埗區', '九龍城區', '黃大仙區', '觀塘區'],
  '新界': ['葵青區', '荃灣區', '屯門區', '元朗區', '北區', '大埔區', '沙田區', '西貢區', '離島區']
};

// 運動類型數據
const SPORT_CATEGORIES = [
  { id: 'all', name: '全部', icon: 'apps' },
  { id: 'fitness', name: '健身', icon: 'dumbbell' },
  { id: 'yoga', name: '瑜伽', icon: 'meditation' },
  { id: 'pilates', name: '普拉提', icon: 'human-handsup' },
  { id: 'cardio', name: '有氧運動', icon: 'heart-pulse' },
  { id: 'strength', name: '重量訓練', icon: 'weight-lifter' },
  { id: 'boxing', name: '拳擊', icon: 'boxing-glove' },
  { id: 'dance', name: '舞蹈', icon: 'dance-ballroom' },
  { id: 'swimming', name: '游泳', icon: 'swim' },
];

// 價錢範圍選項
const PRICE_RANGES = [
  { id: 'all', label: '全部價錢', min: 0, max: Infinity },
  { id: 'budget', label: 'HK$500以下', min: 0, max: 500 },
  { id: 'moderate', label: 'HK$500-700', min: 500, max: 700 },
  { id: 'premium', label: 'HK$700-900', min: 700, max: 900 },
  { id: 'luxury', label: 'HK$900以上', min: 900, max: Infinity },
];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function FindCoachScreen({ navigation }) {
  // 篩選狀態
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedSports, setSelectedSports] = useState(['all']);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [filterExpanded, setFilterExpanded] = useState(false);
  
  // 動畫相關
  const filterHeight = useRef(new Animated.Value(0)).current;
  
  // 教練數據狀態
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [currentCoachIndex, setCurrentCoachIndex] = useState(0);

  // 模擬教練數據
  const mockCoaches = [
    {
      id: 1,
      name: '李健身教練',
      age: 28,
      specialties: ['重量訓練', '健身', '營養指導'],
      teachingAreas: ['中西區', '灣仔區'],
      bio: '專業健身教練，專注於重量訓練和體能提升，擁有5年豐富教學經驗。致力於幫助學員達成健身目標。',
      photos: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
      ],
      rating: 4.8,
      studentsCount: 156,
      experience: '5年',
      certification: 'ACSM認證',
      price: 'HK$800/堂',
      languages: ['粵語', '普通話', '英語'],
      achievements: '2022年最佳健身教練獎',
    },
    {
      id: 2,
      name: '王瑜伽導師',
      age: 32,
      specialties: ['瑜伽', '普拉提', '舞蹈'],
      teachingAreas: ['觀塘區', '沙田區'],
      bio: '資深瑜伽導師，專精於哈達瑜伽和流瑜伽。擁有10年教學經驗，幫助過千名學員改善身心健康。',
      photos: [
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        'https://images.unsplash.com/photo-1506629905270-11674204b5c5?w=400',
      ],
      rating: 4.9,
      studentsCount: 223,
      experience: '10年',
      certification: '200小時瑜伽導師認證',
      price: 'HK$600/堂',
      languages: ['粵語', '普通話'],
      achievements: '國際瑜伽聯盟認證導師',
    },
    {
      id: 3,
      name: '陳有氧教練',
      age: 26,
      specialties: ['有氧運動', '拳擊', '舞蹈'],
      teachingAreas: ['九龍城區', '黃大仙區'],
      bio: '活力充沛的有氧運動教練，專門設計高強度間歇訓練課程。讓運動變得有趣又有效！',
      photos: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      ],
      rating: 4.7,
      studentsCount: 89,
      experience: '3年',
      certification: 'HIIT專業認證',
      price: 'HK$700/堂',
      languages: ['粵語', '英語'],
      achievements: '健身比賽亞軍',
    },
    {
      id: 4,
      name: '張游泳教練',
      age: 35,
      specialties: ['游泳', '有氧運動'],
      teachingAreas: ['葵青區', '荃灣區'],
      bio: '前專業游泳選手，現為專業游泳教練。無論是初學者還是進階訓練，都能提供最專業的指導。',
      photos: [
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      ],
      rating: 4.9,
      studentsCount: 134,
      experience: '8年',
      certification: '游泳教練員證書',
      price: 'HK$900/堂',
      languages: ['粵語', '普通話', '英語'],
      achievements: '全港游泳錦標賽冠軍',
    },
  ];

  useEffect(() => {
    setCoaches(mockCoaches);
    setFilteredCoaches(mockCoaches);
  }, []);

  // 提取教練價錢數字
  const extractPrice = (priceString) => {
    const match = priceString.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // 篩選邏輯
  const applyFilters = () => {
    let filtered = coaches;

    // 地區篩選
    if (selectedDistricts.length > 0) {
      filtered = filtered.filter(coach =>
        coach.teachingAreas.some(area => selectedDistricts.includes(area))
      );
    }

    // 運動類型篩選
    if (!selectedSports.includes('all') && selectedSports.length > 0) {
      const sportNames = selectedSports.map(sportId => 
        SPORT_CATEGORIES.find(cat => cat.id === sportId)?.name
      ).filter(Boolean);
      
      filtered = filtered.filter(coach =>
        coach.specialties.some(specialty => sportNames.includes(specialty))
      );
    }

    // 價錢範圍篩選
    if (selectedPriceRange !== 'all') {
      const priceRange = PRICE_RANGES.find(range => range.id === selectedPriceRange);
      if (priceRange) {
        filtered = filtered.filter(coach => {
          const coachPrice = extractPrice(coach.price);
          return coachPrice >= priceRange.min && coachPrice <= priceRange.max;
        });
      }
    }

    setFilteredCoaches(filtered);
    setCurrentCoachIndex(0);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedDistricts, selectedSports, selectedPriceRange]);

  // 處理地區選擇
  const toggleDistrict = (district) => {
    setSelectedDistricts(prev => {
      if (prev.includes(district)) {
        return prev.filter(d => d !== district);
      } else {
        return [...prev, district];
      }
    });
  };

  // 處理運動類型選擇
  const toggleSport = (sportId) => {
    if (sportId === 'all') {
      setSelectedSports(['all']);
    } else {
      setSelectedSports(prev => {
        const newSports = prev.includes(sportId)
          ? prev.filter(id => id !== sportId)
          : [...prev.filter(id => id !== 'all'), sportId];
        
        return newSports.length === 0 ? ['all'] : newSports;
      });
    }
  };

  // 處理價錢範圍選擇
  const togglePriceRange = (priceRangeId) => {
    setSelectedPriceRange(priceRangeId);
  };

  // 切換篩選展開/收合
  const toggleFilterExpand = () => {
    const toValue = filterExpanded ? 0 : 320; // 320 是展開後的高度
    
    Animated.timing(filterHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setFilterExpanded(!filterExpanded);
  };

  // 清除所有篩選
  const clearAllFilters = () => {
    setSelectedDistricts([]);
    setSelectedSports(['all']);
    setSelectedPriceRange('all');
  };

  // 渲染教練卡片
  const renderCoachCard = ({ item, index }) => {
    const isActive = index === currentCoachIndex;
    
    return (
      <View style={[styles.coachCard, isActive && styles.activeCoachCard]}>
        {/* 教練照片 */}
        <View style={styles.photoContainer}>
          {item.photos && item.photos.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.photosScrollView}
            >
              {item.photos.map((photo, photoIndex) => (
                <Image
                  key={photoIndex}
                  source={{ uri: photo }}
                  style={styles.coachPhoto}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.placeholderPhoto}>
              <MaterialCommunityIcons name="account" size={80} color="#A9A9A9" />
            </View>
          )}
          
          {/* 照片指示器 */}
          {item.photos && item.photos.length > 1 && (
            <View style={styles.photoIndicators}>
              {item.photos.map((_, photoIndex) => (
                <View
                  key={photoIndex}
                  style={[styles.photoIndicator, photoIndex === 0 && styles.activePhotoIndicator]}
                />
              ))}
            </View>
          )}
        </View>

        {/* 教練信息 */}
        <View style={styles.coachInfo}>
          <View style={styles.coachHeader}>
            <View style={styles.coachBasicInfo}>
              <Text style={styles.coachName}>{item.name}</Text>
              <Text style={styles.coachAge}>年齡 {item.age}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
          </View>

          {/* 專業領域標籤 */}
          <View style={styles.specialtiesContainer}>
            {item.specialties.slice(0, 3).map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>

          {/* 教練簡介 */}
          <Text style={styles.coachBio} numberOfLines={3}>
            {item.bio}
          </Text>

          {/* 詳細信息 */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#00CED1" />
              <Text style={styles.detailText}>
                {item.teachingAreas.slice(0, 2).join('、')}
                {item.teachingAreas.length > 2 && '...'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="account-group" size={16} color="#00CED1" />
              <Text style={styles.detailText}>{item.studentsCount} 名學生</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock" size={16} color="#00CED1" />
              <Text style={styles.detailText}>{item.experience}經驗</Text>
            </View>
          </View>

          {/* 價格和操作按鈕 */}
          <View style={styles.actionContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.viewProfileButton}>
                <MaterialCommunityIcons name="account-details" size={20} color="#00CED1" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton}>
                <MaterialCommunityIcons name="message" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // 渲染摺疊式篩選面板
  const renderCollapsibleFilter = () => (
    <Animated.View style={[styles.collapsibleFilterContainer, { height: filterHeight }]}>
      <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
        {/* 地區篩選 */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>教授地區</Text>
          {Object.entries(HONG_KONG_DISTRICTS).map(([region, districts]) => (
            <View key={region} style={styles.regionContainer}>
              <Text style={styles.regionTitle}>{region}</Text>
              <View style={styles.districtsGrid}>
                {districts.map(district => (
                  <TouchableOpacity
                    key={district}
                    style={[
                      styles.districtChip,
                      selectedDistricts.includes(district) && styles.selectedDistrictChip
                    ]}
                    onPress={() => toggleDistrict(district)}
                  >
                    <Text style={[
                      styles.districtChipText,
                      selectedDistricts.includes(district) && styles.selectedDistrictChipText
                    ]}>
                      {district}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* 運動類型篩選 */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>運動類型</Text>
          <View style={styles.sportsGrid}>
            {SPORT_CATEGORIES.map(sport => (
              <TouchableOpacity
                key={sport.id}
                style={[
                  styles.sportChip,
                  selectedSports.includes(sport.id) && styles.selectedSportChip
                ]}
                onPress={() => toggleSport(sport.id)}
              >
                <MaterialCommunityIcons
                  name={sport.icon}
                  size={20}
                  color={selectedSports.includes(sport.id) ? '#FFFFFF' : '#00CED1'}
                />
                <Text style={[
                  styles.sportChipText,
                  selectedSports.includes(sport.id) && styles.selectedSportChipText
                ]}>
                  {sport.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 價錢範圍篩選 */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>價錢範圍</Text>
          <View style={styles.priceGrid}>
            {PRICE_RANGES.map(priceRange => (
              <TouchableOpacity
                key={priceRange.id}
                style={[
                  styles.priceChip,
                  selectedPriceRange === priceRange.id && styles.selectedPriceChip
                ]}
                onPress={() => togglePriceRange(priceRange.id)}
              >
                <MaterialCommunityIcons
                  name="currency-usd"
                  size={20}
                  color={selectedPriceRange === priceRange.id ? '#FFFFFF' : '#00CED1'}
                />
                <Text style={[
                  styles.priceChipText,
                  selectedPriceRange === priceRange.id && styles.selectedPriceChipText
                ]}>
                  {priceRange.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 篩選操作按鈕 */}
      <View style={styles.filterButtons}>
        <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
          <Text style={styles.clearButtonText}>清除篩選</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={toggleFilterExpand}
        >
          <Text style={styles.applyButtonText}>
            收起篩選 ({filteredCoaches.length})
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      
      {/* 標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>尋找教練</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={toggleFilterExpand}
        >
          <MaterialCommunityIcons 
            name={filterExpanded ? "chevron-up" : "filter-variant"} 
            size={24} 
            color="#00CED1" 
          />
          {(selectedDistricts.length > 0 || !selectedSports.includes('all') || selectedPriceRange !== 'all') && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* 篩選狀態顯示 */}
      {(selectedDistricts.length > 0 || !selectedSports.includes('all') || selectedPriceRange !== 'all') && (
        <View style={styles.filterStatus}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedDistricts.map(district => (
              <View key={district} style={styles.filterTag}>
                <Text style={styles.filterTagText}>{district}</Text>
              </View>
            ))}
            {selectedSports.filter(id => id !== 'all').map(sportId => {
              const sport = SPORT_CATEGORIES.find(cat => cat.id === sportId);
              return sport ? (
                <View key={sportId} style={styles.filterTag}>
                  <Text style={styles.filterTagText}>{sport.name}</Text>
                </View>
              ) : null;
            })}
            {selectedPriceRange !== 'all' && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>
                  {PRICE_RANGES.find(range => range.id === selectedPriceRange)?.label}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* 摺疊式篩選面板 */}
      {renderCollapsibleFilter()}

      {/* 教練列表 */}
      <View style={styles.coachesContainer}>
        {filteredCoaches.length > 0 ? (
          <FlatList
            data={filteredCoaches}
            renderItem={renderCoachCard}
            keyExtractor={(item) => item.id.toString()}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.y / (screenHeight - 200));
              setCurrentCoachIndex(Math.max(0, Math.min(index, filteredCoaches.length - 1)));
            }}
            getItemLayout={(data, index) => ({
              length: screenHeight - 200,
              offset: (screenHeight - 200) * index,
              index,
            })}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-search" size={80} color="#A9A9A9" />
            <Text style={styles.emptyTitle}>找不到符合條件的教練</Text>
            <Text style={styles.emptyText}>
              請嘗試調整篩選條件或清除所有篩選
            </Text>
            <TouchableOpacity style={styles.resetFiltersButton} onPress={clearAllFilters}>
              <Text style={styles.resetFiltersButtonText}>重置篩選</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 教練數量指示器 */}
      {filteredCoaches.length > 0 && (
        <View style={styles.coachCounter}>
          <Text style={styles.counterText}>
            {currentCoachIndex + 1} / {filteredCoaches.length}
          </Text>
        </View>
      )}
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
  filterButton: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  filterStatus: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3A3B',
  },
  filterTag: {
    backgroundColor: '#00CED1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  coachesContainer: {
    flex: 1,
  },
  coachCard: {
    height: screenHeight - 200,
    backgroundColor: '#2E3A3B',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  activeCoachCard: {
    borderWidth: 2,
    borderColor: '#00CED1',
  },
  photoContainer: {
    height: screenHeight * 0.45,
    position: 'relative',
  },
  photosScrollView: {
    flex: 1,
  },
  coachPhoto: {
    width: screenWidth - 40,
    height: '100%',
  },
  placeholderPhoto: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C2526',
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activePhotoIndicator: {
    backgroundColor: '#FFFFFF',
  },
  coachInfo: {
    flex: 1,
    padding: 20,
  },
  coachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  coachBasicInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  coachAge: {
    fontSize: 14,
    color: '#A9A9A9',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: '#00CED1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  coachBio: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#A9A9A9',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00CED1',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewProfileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00CED1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00CED1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachCounter: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#A9A9A9',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetFiltersButton: {
    backgroundColor: '#00CED1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  resetFiltersButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // 摺疊式篩選樣式
  collapsibleFilterContainer: {
    backgroundColor: '#2E3A3B',
    overflow: 'hidden',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterSection: {
    marginVertical: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  regionContainer: {
    marginBottom: 20,
  },
  regionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00CED1',
    marginBottom: 12,
  },
  districtsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  districtChip: {
    backgroundColor: '#1C2526',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3E4A4B',
  },
  selectedDistrictChip: {
    backgroundColor: '#00CED1',
    borderColor: '#00CED1',
  },
  districtChipText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  selectedDistrictChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2526',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3E4A4B',
    gap: 8,
  },
  selectedSportChip: {
    backgroundColor: '#00CED1',
    borderColor: '#00CED1',
  },
  sportChipText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  selectedSportChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2526',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3E4A4B',
    gap: 8,
    minWidth: '45%',
  },
  selectedPriceChip: {
    backgroundColor: '#00CED1',
    borderColor: '#00CED1',
  },
  priceChipText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  selectedPriceChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#3E4A4B',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#1C2526',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3E4A4B',
  },
  clearButtonText: {
    color: '#A9A9A9',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#00CED1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
}); 