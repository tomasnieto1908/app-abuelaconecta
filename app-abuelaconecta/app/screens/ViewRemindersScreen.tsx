import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
// IMPORTANTE: usamos 'useFocusEffect' de expo-router para manejar el enfoque
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Interfaz que debe coincidir exactamente con el objeto guardado en ReminderScreen.tsx
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
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  /**
   * Carga los recordatorios desde AsyncStorage, los ordena y actualiza el estado.
   */
  const loadReminders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const remindersJson = await AsyncStorage.getItem(REMINDERS_KEY);
      if (remindersJson) {
        let loadedReminders: Reminder[] = JSON.parse(remindersJson); 
        
        // Ordena por hora para mejor visualización
        loadedReminders.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
        
        setReminders(loadedReminders);
      } else {
        setReminders([]);
      }
    } catch (e) {
      console.error("Error cargando recordatorios:", e);
      Alert.alert("Error de Carga", "Error al leer los datos. Asegúrate de que AsyncStorage esté instalado.");
      setReminders([]);
    } finally {
        setIsRefreshing(false);
    }
  }, []); 

  // --- EFECTO DE ENFOQUE CORREGIDO (useFocusEffect) ---
  // Ejecuta loadReminders cada vez que la pantalla se enfoca (al abrirla o volver de otra pantalla)
  useFocusEffect(
    useCallback(() => {
      loadReminders();
      // No necesitamos retornar un listener como antes, solo ejecutar la función
    }, [loadReminders])
  );
 
  /**
   * Elimina un recordatorio del sistema y del almacenamiento.
   */
  const handleDeleteReminder = async (id: string) => {
    Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de que quieres eliminar este recordatorio?",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Eliminar", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        await Notifications.cancelScheduledNotificationAsync(id);

                        const updatedReminders = reminders.filter(r => r.id !== id);
                        await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
                        
                        setReminders(updatedReminders);
                        Alert.alert("Éxito", "Recordatorio eliminado.");
                    } catch (error) {
                        console.error("Error al eliminar recordatorio:", error);
                        Alert.alert("Error", "No se pudo eliminar el recordatorio.");
                    }
                }
            },
        ]
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/screens/MenuScreen'); 
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>← atrás</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Recordatorios Activos</Text>

      <ScrollView 
        style={styles.remindersContainer}
        refreshControl={
            <RefreshControl 
                refreshing={isRefreshing} 
                onRefresh={loadReminders} 
                tintColor="#fff"
            />
        }
      >
        {reminders.length > 0 ? (
            reminders.map((reminder) => (
                <View key={reminder.id} style={styles.reminderItem}>
                    <Text style={styles.reminderTime}>{reminder.time}</Text> 
                    <Text style={styles.reminderText}>{reminder.text}</Text>
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteReminder(reminder.id)}
                    >
                        <Text style={styles.deleteButtonText}>X</Text>
                    </TouchableOpacity>
                </View>
            ))
        ) : (
             <Text style={styles.emptyText}>
                No hay recordatorios programados.{"\n"}
                (Desliza hacia abajo para recargar)
             </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1033a3", padding: 24 },
  backButton: { backgroundColor: "#000", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, alignSelf: "flex-start", marginBottom: 24 },
  backButtonText: { color: "#fff", fontSize: 14 },
  title: { fontSize: 36, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 24 },
  remindersContainer: { flex: 1 ,},
  reminderItem: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  reminderTime: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1033a3',
      marginRight: 15,
      width: 70,
  },
  reminderText: { 
      flex: 1, 
      fontSize: 18, 
      color: '#333', 
  },
  deleteButton: {
      marginLeft: 15,
      backgroundColor: '#ff3d3d',
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
  },
  deleteButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
  },
  emptyText: { color: "#ccc", fontSize: 20, textAlign: "center", marginTop: 50 },
});