# 🏋️‍♂️ Fitness App

一個功能豐富的 React Native 健身應用程式，使用 Expo 開發，提供完整的健身追蹤和管理功能。

## ✨ 主要功能

### 📅 日曆系統
- **智能月曆視圖**：完整的月份顯示，支援月份切換
- **響應式設計**：完美適應不同螢幕尺寸
- **今日高亮**：自動標記當前日期
- **週末標記**：特殊顏色顯示週末日期
- **直觀導航**：左右箭頭切換月份，點擊標題回到今天

### 📊 儀表板 (Dashboard)
- **週曆概覽**：顯示本週日期，高亮今天
- **今日訓練**：完整的訓練計劃表格
  - 訓練項目、重量、組數、次數
  - 一鍵標記完成功能
  - 動態狀態更新
- **Progress 卡片**：
  - 實時同步飲食記錄數據
  - 顯示剩餘卡路里（與飲食記錄頁面數據一致）
  - 可點擊跳轉至飲食記錄頁面
  - 自動載入今日實際攝入卡路里
- **智能評論**：隨機生成每日激勵語
- **拍照打卡**：支援相機功能（開發版本暫時禁用）

### 🍎 飲食記錄系統（完整實現）
- **卡路里追蹤**：目標卡路里 vs 實際攝入對比，剩餘卡路里計算
- **營養素分佈**：碳水化合物、脂肪、蛋白質圓形進度圖和剩餘量顯示
- **完整記錄功能**：
  - 記錄食品：搜索24種常見食物，自定義份量，實時營養計算
  - 條碼掃描：預留功能接口（開發中）
  - 體重記錄：身高體重輸入、BMI自動計算、歷史記錄和趨勢分析
  - 運動記錄：8種運動類型、時長記錄、卡路里消耗計算
- **智能數據管理**：
  - AsyncStorage 本地存儲
  - 按日期分類的數據結構（diet_YYYY-MM-DD、exercise_YYYY-MM-DD、weight_records）
  - 自動營養成分計算
  - 歷史記錄統計分析
  - Dashboard 與飲食記錄數據實時同步
- **用戶體驗優化**：
  - 模態框交互設計
  - 表單驗證和錯誤處理
  - Loading 狀態和空狀態提示
  - 一鍵刪除功能
  - 錯誤邊界和自動恢復機制

### 🎨 設計特色
- **深色主題**：專業的暗色系設計風格
- **一致配色**：
  - 主背景：#1C2526（深灰）
  - 卡片背景：#2E3A3B（深藍綠）
  - 主文字：#FFFFFF（白色）
  - 副文字：#A9A9A9（淺灰）
  - 重點色：#00CED1（青色）
- **響應式布局**：適應各種螢幕尺寸
- **流暢動畫**：優化的用戶體驗

## 🚀 技術架構

### 前端框架
- **React Native + Expo**：跨平台移動應用開發
- **React Navigation**：底部標籤導航和堆疊導航
- **React Hooks**：現代化狀態管理

### UI 組件庫
- **@expo/vector-icons**：Material Community Icons
- **react-native-chart-kit**：數據可視化圖表
- **react-native-calendars**：日曆組件
- **react-native-svg**：矢量圖形支援

### 媒體處理
- **react-native-image-picker**：相機和相簿訪問

## 📱 頁面結構

### 底部導航
1. **📅 Calendar**：月曆視圖和日期管理
2. **👥 Community**：社群功能（開發中）
3. **📊 Dashboard**：數據儀表板、訓練追蹤和飲食記錄入口
4. **📚 Library**：運動資料庫（開發中）
5. **⚙️ Settings**：應用設定（開發中）

### Stack 導航結構
```
Dashboard Stack:
├── DashboardMain (主儀表板)
└── Diet Stack (飲食記錄系統)
    ├── DietMain (飲食記錄主頁)
    ├── AddFood (添加食物)
    ├── WeightRecord (體重記錄)
    └── ExerciseRecord (運動記錄)
```

## 🛠️ 安裝與運行

### 環境要求
- Node.js (v16 或更高版本)
- npm 或 yarn
- Expo CLI
- iOS Simulator 或 Android Emulator

### 安裝步驟

```bash
# 克隆專案
git clone https://github.com/CasTPAcaDz7/fitness-app.git
cd fitness-app/FitnessApp

# 安裝依賴項
npm install

# 安裝額外的圖表和媒體依賴
npm install react-native-calendars react-native-chart-kit react-native-svg react-native-image-picker

# 啟動開發服務器
npx expo start
```

### 運行選項
- **iOS**：按 `i` 在 iOS 模擬器中運行
- **Android**：按 `a` 在 Android 模擬器中運行
- **Web**：按 `w` 在瀏覽器中運行
- **實體設備**：使用 Expo Go 應用掃描 QR 碼

## 📦 依賴項

### 核心依賴
```json
{
  "@expo/vector-icons": "^14.0.4",
  "@react-navigation/bottom-tabs": "^7.1.0",
  "@react-navigation/native": "^7.0.15",
  "expo": "~53.0.0",
  "react": "18.3.1",
  "react-native": "0.76.5"
}
```

### 功能依賴
```json
{
  "react-native-calendars": "^1.1306.0",
  "react-native-chart-kit": "^6.12.0",
  "react-native-svg": "^15.8.0",
  "react-native-image-picker": "^7.1.2"
}
```

## 🔧 開發說明

### 項目結構
```
FitnessApp/
├── screens/           # 頁面組件
│   ├── CalendarScreen.js
│   ├── DashboardScreen.js
│   ├── CommunityScreen.js
│   ├── LibraryScreen.js
│   └── SettingsScreen.js
├── navigation/        # 導航配置
│   └── AppNavigator.js
├── components/        # 共用組件
├── assets/           # 靜態資源
└── app.json          # Expo 配置
```

### 數據管理
- 目前使用模擬數據進行開發
- 所有狀態使用 React Hooks 管理
- 預留 Firebase 集成接口

### 樣式規範
- 使用 StyleSheet.create() 創建樣式
- 遵循一致的顏色和字體規範
- 響應式設計原則

## 🎯 未來規劃

### 第一階段（已完成）
- ✅ 基礎項目架構
- ✅ 底部導航系統
- ✅ 日曆功能完整實現
- ✅ Dashboard 核心功能
- ✅ 模擬數據系統

### 第二階段（計劃中）
- 🔄 Firebase 後端集成
- 🔄 用戶認證系統
- 🔄 真實數據存儲
- 🔄 社群功能開發
- 🔄 運動資料庫

### 第三階段（未來）
- 📋 個人訓練計劃
- 📊 進階數據分析
- 🏆 成就系統
- 📱 推送通知
- 🌐 多語言支援

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 許可證

MIT License

## 📞 聯繫

- GitHub: [@CasTPAcaDz7](https://github.com/CasTPAcaDz7)
- Repository: [fitness-app](https://github.com/CasTPAcaDz7/fitness-app)

---

**最後更新**: 2024年12月 - 完成 Dashboard 功能開發 

### 最新更新 (Latest Updates)
- ✅ **關鍵錯誤修復**：
  - 修復 DietScreen.js 中 "foods.forEach is not a function" 錯誤
  - 修復 AddFoodScreen.js 中 "todayFoods.push is not a function" 錯誤
  - 增強 AsyncStorage 數據驗證和錯誤處理
  - 添加數組類型檢查，防止數據格式不正確導致的崩潰
  - 改善錯誤提示和用戶反饋
- ✅ **Dashboard Progress 圖表優化**：
  - 移除 Weight Progress 卡片，簡化界面設計
  - Diet Progress 重命名為 Progress，聚焦核心功能
  - 圖表改為顯示剩餘卡路里，提供更直觀的進度指示
  - Progress 卡片寬度擴展，居中顯示，增強視覺效果
- ✅ **完整飲食記錄系統實現**：
  - 主飲食記錄頁面：卡路里追蹤、營養素圓形進度圖、四個功能按鈕
  - 添加食物功能：24種常見食物數據庫、搜索過濾、份量調整、營養預覽
  - 體重記錄功能：身高體重輸入、BMI計算、歷史記錄、統計分析
  - 運動記錄功能：8種運動類型、時長記錄、卡路里消耗計算、今日統計
  - Stack Navigation 完整導航架構
  - AsyncStorage 本地數據存儲
  - 表單驗證、錯誤處理、Loading狀態
- ✅ **飲食記錄功能準備**：
  - Dashboard 中的 Diet Progress 卡片現在可點擊
  - 點擊後將導航到飲食記錄頁面（已完成開發）
  - 為完整的飲食追蹤系統奠定基礎
- ✅ **當天標記優化**: 
  - 增加當天日期標記的白色背景高度
  - 保持寬度不變，只增加垂直方向的視覺突出度
  - 提升當天日期的識別度和視覺焦點
- ✅ **週曆間距優化**: 
  - 日期標記進一步向上移動，更緊貼容器頂部
  - 大幅縮小週曆與Today Workouts之間的距離，布局更緊湊
  - 移除不必要的spacer空間，提高內容密度
  - 優化整體頁面佈局的緊湊性和流暢度
- ✅ **Today Workouts表格優化**: 
  - 修復標題和內容對齊問題
  - Training列改為左對齊，提高可讀性
  - 按鈕列正確對齊，布局更整潔
  - 優化按鈕尺寸和間距
- ✅ **週曆UI優化**: 
  - 重新排序為週日至週六的傳統順序
  - 日期數字緊貼容器上方，提高視覺層次
  - 當天標記更大更明顯，添加陰影效果
  - 優化間距和字體大小，提升可讀性
- ✅ **日期導航優化**: 每個日期格子都可點擊，直接導航到月曆中對應的日期
- ✅ **佈局改進**: 週曆空間擴大，底部內容重新配置靠近工具欄
- ✅ **相容性修復**: 移除了導致 iOS Expo Go 問題的複雜依賴項
- ✅ **UI 優化**: 統一暗色主題設計，改善用戶體驗 

## 📝 更新日誌

### 最新更新 - Dashboard 數據同步優化
- **修復問題**：Dashboard 中 Progress 卡片顯示的卡路里與飲食記錄頁面數據不同步
- **優化內容**：
  - 新增 `loadDietData()` 函數從 AsyncStorage 讀取實際飲食數據
  - 添加 `dietData` 狀態管理今日卡路里攝入情況
  - 實現 Navigation Focus 監聽器，當用戶返回 Dashboard 時自動重新載入數據
  - Progress 卡片現在顯示真實的剩餘卡路里，與飲食記錄頁面完全同步
  - 增強錯誤處理，確保數據載入失敗時使用預設值

### 飲食記錄系統錯誤修復
- **修復問題**：
  - DietScreen.js: "foods.forEach is not a function (it is undefined)" 錯誤
  - AddFoodScreen.js: "todayFoods.push is not a function (it is undefined)" 錯誤
- **解決方案**：
  - 在所有數組操作前添加 Array.isArray() 類型檢查
  - 增強 AsyncStorage 數據解析的 try-catch 錯誤處理
  - 實現自動錯誤恢復，數據格式不正確時重置為空數組
  - 改善錯誤提示和用戶反饋機制 