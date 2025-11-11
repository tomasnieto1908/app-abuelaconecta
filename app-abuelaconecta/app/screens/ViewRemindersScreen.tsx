// ViewRemindersScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Reminder {
  id: string;
  text: string;
  time: string;
  hour: number;
  minute: number;
}

const REMINDERS_KEY = '@my_reminders';

export default function ViewRemindersScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadReminders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const json = await AsyncStorage.getItem(REMINDERS_KEY);
      const list: Reminder[] = json ? JSON.parse(json) : [];
      list.sort((a,b) => a.hour*60+a.minute - (b.hour*60+b.minute));
      setReminders(list);
    } catch (e) { console.error(e); setReminders([]); }
    finally { setIsRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadReminders(); }, [loadReminders]));

  const handleDelete = async (id: string) => {
    Alert.alert("Eliminar", "¿Eliminar este recordatorio?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          // Borra de AsyncStorage
          const updated = reminders.filter(r => r.id !== id);
          await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
          setReminders(updated);
        } catch (e) { console.error(e); Alert.alert("Error", "No se pudo eliminar"); }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← atrás</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Recordatorios Activos</Text>

      <ScrollView style={styles.remindersContainer} refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={loadReminders} tintColor="#fff"/>
      }>
        {reminders.length > 0 ? reminders.map(r => (
          <View key={r.id} style={styles.item}>
            <Text style={styles.time}>{r.time}</Text>
            <Text style={styles.text}>{r.text}</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(r.id)}>
              <Text style={styles.deleteButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        )) : (
          <Text style={styles.empty}>No hay recordatorios</Text>
        )}
      </ScrollView>
    </View>
  );
}

import { RefreshControl } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1033a3", padding: 24 },
  backButton: { backgroundColor: "#000", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, alignSelf: "flex-start", marginBottom: 24 },
  backButtonText: { color: "#fff", fontSize: 14 },
  title: { fontSize: 32, color: "#fff", fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  remindersContainer: { flex: 1 },
  item: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center' },
  time: { fontSize: 24, fontWeight: 'bold', color: '#1033a3', width: 70 },
  text: { flex: 1, fontSize: 18, color: '#333' },
  deleteButton: { marginLeft: 15, backgroundColor: '#ff3d3d', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  empty: { color: '#ccc', fontSize: 20, textAlign: 'center', marginTop: 50 },
});
