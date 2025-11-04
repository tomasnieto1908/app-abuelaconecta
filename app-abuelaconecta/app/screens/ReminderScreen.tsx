import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Define la estructura para el objeto que guardaremos
interface Reminder {
    id: string; // ID de la notificación para poder cancelarla
    text: string;
    time: string; // "HH:MM" para mostrar
    hour: number;
    minute: number;
}

const REMINDERS_KEY = '@my_reminders';

export default function ReminderScreen() {
  const router = useRouter();

  const [reminderText, setReminderText] = useState<string>("");
  const [hours, setHours] = useState<string>("17");
  const [minutes, setMinutes] = useState<string>("00");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  /**
   * Programa una notificación diaria recurrente y guarda el registro en AsyncStorage.
   */
  const handleSetReminder = async () => {
    const reminder = reminderText.trim();
    const parsedHours = parseInt(hours, 10);
    const parsedMinutes = parseInt(minutes, 10);

    // 1. VALIDACIÓN
    if (!reminder) {
        Alert.alert("Error", "Por favor, escribe el mensaje del recordatorio.");
        return;
    }
    if (isNaN(parsedHours) || parsedHours < 0 || parsedHours > 23 || 
        isNaN(parsedMinutes) || parsedMinutes < 0 || parsedMinutes > 59) {
        Alert.alert("Error", "La hora debe estar entre 00-23 y los minutos entre 00-59.");
        return;
    }

    try {
        // 2. SOLICITAR PERMISOS
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
             Alert.alert("Permiso Denegado", "Necesitas conceder permiso de notificaciones para activar recordatorios.");
             return;
        }

        // 3. Programar la notificación y obtener su ID
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '⏰ Recordatorio Diario',
                body: reminder,
                sound: true,
                channelId: 'mqtt-alerts',
            },
            trigger: {
              hour: parsedHours,
              minute: parsedMinutes,
              repeats: true, 
            },
        });
        
        // 4. Crear objeto de almacenamiento
        const newReminder: Reminder = { 
            id: notificationId, 
            text: reminder,
            time: `${parsedHours.toString().padStart(2, '0')}:${parsedMinutes.toString().padStart(2, '0')}`,
            hour: parsedHours,
            minute: parsedMinutes,
        };

        // 5. Guardar en AsyncStorage
        const existingRemindersJson = await AsyncStorage.getItem(REMINDERS_KEY);
        const existingReminders: Reminder[] = existingRemindersJson ? JSON.parse(existingRemindersJson) : [];
        
        const updatedReminders = [...existingReminders, newReminder];
        await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));

        // 6. ÉXITO
        setReminderText("");
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/screens/MenuScreen');
        }, 2000);

    } catch (error) {
        console.error("Error al programar/guardar recordatorio:", error);
        Alert.alert("Error", "No se pudo activar el recordatorio. Intente de nuevo.");
    }
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

      <Text style={styles.title}>Recordatorio</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={reminderText}
          onChangeText={setReminderText}
          placeholder="Escribe el mensaje del recordatorio"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.timePickerContainer}>
        <Text style={styles.timePickerTitle}>Hora del recordatorio (Diario)</Text>
        <View style={styles.timePicker}>
          <TextInput
            style={styles.timeInput}
            value={hours}
            onChangeText={(text: string) => setHours(text.replace(/[^0-9]/g, '').substring(0, 2))}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.timeSeparator}>:</Text>
          <TextInput
            style={styles.timeInput}
            value={minutes}
            onChangeText={(text: string) => setMinutes(text.replace(/[^0-9]/g, '').substring(0, 2))}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.sendButton} onPress={handleSetReminder}>
        <Text style={styles.sendButtonText}>Activar Recordatorio Diario</Text>
      </TouchableOpacity>

      {showSuccess && <Text style={styles.successText}>Se activó el recordatorio</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1033a3", padding: 24 },
  backButton: { backgroundColor: "#000", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, alignSelf: "flex-start", marginBottom: 24 },
  backButtonText: { color: "#fff", fontSize: 14 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 24 },
  inputContainer: { backgroundColor: "#fff", borderRadius: 8, padding: 24, marginBottom: 24 },
  textInput: { fontSize: 18, backgroundColor: "#f5f5f5", padding: 16, borderRadius: 4, minHeight: 80, textAlignVertical: 'top' },
  timePickerTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 16 },
  timePickerContainer: { backgroundColor: "#fff", borderRadius: 8, padding: 24, marginBottom: 24, alignItems: "center" },
  timePicker: { flexDirection: "row", alignItems: "center", marginBottom: 0 },
  timeInput: { width: 72, height: 56, borderWidth: 2, borderColor: "#1033a3", borderRadius: 8, textAlign: "center", fontSize: 24, backgroundColor: "#fff", fontWeight: 'bold' },
  timeSeparator: { fontSize: 32, marginHorizontal: 8, fontWeight: 'bold', color: '#1033a3' },
  sendButton: { backgroundColor: "#000", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
  sendButtonText: { color: "#fff", fontSize: 20, fontWeight: "600" },
  successText: { color: "#0f0", fontSize: 20, fontWeight: "bold", textAlign: "center", marginTop: 16 },
});