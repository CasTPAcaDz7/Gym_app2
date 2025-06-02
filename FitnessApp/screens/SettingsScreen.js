import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C2526" />
      <View style={styles.contentCard}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.description}>設定功能將在此處開發</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2526',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCard: {
    backgroundColor: '#2E3A3B',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#404040',
    minWidth: 280,
  },
  title: {
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#A9A9A9',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.3,
  },
}); 