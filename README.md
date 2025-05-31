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

## 📝 更新日誌

### 最新更新 - 月曆版面優化與融合設計
- **視覺融合改進**：活動顯示區域與月曆更加一體化
  - 統一背景色彩（#000000），移除分離感強的圓角設計
  - 活動區域採用細線分隔取代圓角，保持視覺連貫性
  - 活動項目採用左側邊框強調，與選中日期顏色呼應
  - 調整圖標大小和配色，與整體暗色主題更協調
- **週末顏色調整**：星期六日期顏色與平日一致
  - 只有星期日保持紅色特殊顯示
  - 星期六改為正常白色，符合使用習慣
- **今日標識優化**：
  - 金色星星圖標清楚標示今日
  - 今日日期背景為紅色圓形，視覺突出
  - 選中日期背景為青色圓形，操作反饋明確
- **活動顯示功能**：
  - 模擬今日活動：胸部訓練、記錄早餐、體重記錄
  - 活動指示點標記有活動的日期
  - 點擊日期切換顯示該日活動
  - 空狀態友好提示

### 預設頁面優化
- **用戶體驗改進**：將應用程式預設頁面設置為 Dashboard
- **實現方式**：
  - 修改 `AppNavigator.js` 中的 Tab.Navigator 配置
  - 添加 `initialRouteName="Dashboard"` 屬性
  - 重新排列 Tab.Screen 順序，將 Dashboard 移至首位
  - 確保應用程式啟動時直接顯示功能豐富的 Dashboard 頁面

### Dashboard 數據同步優化
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