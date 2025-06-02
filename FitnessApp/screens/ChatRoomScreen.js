import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ChatRoomScreen = ({ navigation }) => {
  const chatRooms = [
    {
      id: 1,
      name: '健身新手交流群',
      lastMessage: '今天練胸肌有什麼好建議嗎？',
      unreadCount: 3,
      time: '15:30',
      members: 28,
    },
    {
      id: 2,
      name: '減脂經驗分享',
      lastMessage: '分享一下我的飲食計劃',
      unreadCount: 0,
      time: '14:20',
      members: 42,
    },
    {
      id: 3,
      name: '重訓愛好者',
      lastMessage: '硬舉技巧討論',
      unreadCount: 1,
      time: '13:45',
      members: 67,
    },
    {
      id: 4,
      name: '瑜伽放鬆時光',
      lastMessage: '晚上一起線上瑜伽嗎？',
      unreadCount: 0,
      time: '12:15',
      members: 35,
    },
  ];

  const renderChatRoom = (room) => (
    <TouchableOpacity
      key={room.id}
      style={styles.chatRoomCard}
      onPress={() => {
        // 未來可以導航到具體聊天室
        console.log('進入聊天室:', room.name);
      }}
    >
      <View style={styles.roomIcon}>
        <MaterialCommunityIcons name="account-group" size={32} color="#00CED1" />
      </View>
      
      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomTime}>{room.time}</Text>
        </View>
        
        <View style={styles.roomFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {room.lastMessage}
          </Text>
          <View style={styles.roomStats}>
            <MaterialCommunityIcons name="account" size={14} color="#A9A9A9" />
            <Text style={styles.memberCount}>{room.members}</Text>
            {room.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{room.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>聊天室</Text>
        <TouchableOpacity style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#00CED1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 快速功能區 */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <MaterialCommunityIcons name="message-plus" size={24} color="#00CED1" />
            <Text style={styles.quickActionText}>創建群組</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <MaterialCommunityIcons name="account-search" size={24} color="#00CED1" />
            <Text style={styles.quickActionText}>尋找朋友</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <MaterialCommunityIcons name="fire" size={24} color="#00CED1" />
            <Text style={styles.quickActionText}>熱門話題</Text>
          </TouchableOpacity>
        </View>

        {/* 聊天室列表 */}
        <View style={styles.chatRoomList}>
          <Text style={styles.sectionTitle}>我的群組</Text>
          {chatRooms.map(renderChatRoom)}
        </View>

        {/* 開發中提示 */}
        <View style={styles.developmentNote}>
          <MaterialCommunityIcons name="information" size={20} color="#00CED1" />
          <Text style={styles.noteText}>
            聊天室功能正在開發中，敬請期待！
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    backgroundColor: '#2E3A3B',
    borderBottomWidth: 1,
    borderBottomColor: '#4A5657',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: '#2E3A3B',
    borderRadius: 15,
    padding: 20,
    width: '28%',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  chatRoomList: {
    marginBottom: 30,
  },
  chatRoomCard: {
    flexDirection: 'row',
    backgroundColor: '#2E3A3B',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  roomInfo: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  roomTime: {
    fontSize: 12,
    color: '#A9A9A9',
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#A9A9A9',
    flex: 1,
    marginRight: 10,
  },
  roomStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    color: '#A9A9A9',
    marginLeft: 2,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#00CED1',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  developmentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  noteText: {
    color: '#00CED1',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
});

export default ChatRoomScreen; 