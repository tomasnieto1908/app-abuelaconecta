// ReminderMqttScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { client, enviarMensaje, isConnected } from "@/hooks/mqttClient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";

interface Reminder {
  id: string;
  text: string;
  time: string;
  hour: number;
  minute: number;
}

const REMINDERS_KEY = '@my_reminders';

export default function ReminderMqttScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [hour, setHour] = useState("17");
  const [minute, setMinute] = useState("00");
  const [connectionStatus, setConnectionStatus] = useState(isConnected());
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    const onConnect = () => setConnectionStatus(true);
    const onClose = () => setConnectionStatus(false);
    const onError = () => setConnectionStatus(false);

    client.on("connect", onConnect);
    client.on("close", onClose);
    client.on("error", onError);

    return () => {
      client.removeListener("connect", onConnect);
      client.removeListener("close", onClose);
      client.removeListener("error", onError);
    };
  }, []);

  const handleSchedule = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Escribí un mensaje para enviar.");
      return;
    }

    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      Alert.alert("Error", "Ingresá una hora válida (00–23) y minutos (00–59).");
      return;
    }

    // Calcular delay
    const now = new Date();
    const sendTime = new Date();
    sendTime.setHours(h, m, 0, 0);
    if (sendTime <= now) sendTime.setDate(sendTime.getDate() + 1);
    const delay = sendTime.getTime() - now.getTime();

    // Crear ID único
    const id = `${Date.now()}`;

    const newReminder: Reminder = {
      id,
      text: message,
      time: `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`,
      hour: h,
      minute: m,
    };

    try {
      // Guardar recordatorio
      const existingJson = await AsyncStorage.getItem(REMINDERS_KEY);
      const existing: Reminder[] = existingJson ? JSON.parse(existingJson) : [];
      const updated = [...existing, newReminder];
      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));

      // Programar envío seguro: revisa AsyncStorage antes de enviar
      setTimeout(async () => {
        const storedJson = await AsyncStorage.getItem(REMINDERS_KEY);
        const stored: Reminder[] = storedJson ? JSON.parse(storedJson) : [];
        const stillExists = stored.find(r => r.id === id);
        if (stillExists && isConnected()) {
          enviarMensaje(message);
        }
      }, delay);

      setMessage("");
      Alert.alert("✅ Programado", `Mensaje a enviarse a las ${newReminder.time}`);
      router.push('/screens/ViewRemindersScreen');

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo programar el mensaje.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← atrás</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Nuevo Mensaje MQTT</Text>

      <TextInput
        style={styles.input}
        placeholder="Mensaje a enviar"
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
      />

      <View style={styles.timeRow}>
        <TextInput
          style={styles.timeInput}
          value={hour}
          onChangeText={(t) => setHour(t.replace(/[^0-9]/g, "").substring(0, 2))}
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.timeColon}>:</Text>
        <TextInput
          style={styles.timeInput}
          value={minute}
          onChangeText={(t) => setMinute(t.replace(/[^0-9]/g, "").substring(0, 2))}
          keyboardType="numeric"
          maxLength={2}
        />
      </View>

      <TouchableOpacity
        style={[styles.sendButton, scheduled && styles.disabledButton]}
        onPress={handleSchedule}
        disabled={scheduled}
      >
        <Text style={styles.sendButtonText}>
          {scheduled ? "Programado..." : "Programar envío"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.status}>
        Estado MQTT: {connectionStatus ? "🟢 Conectado" : "🔴 Desconectado"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1033a3", padding: 24 },
  backButton: { backgroundColor: "#000", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, alignSelf: "flex-start", marginBottom: 24 },
  backButtonText: { color: "#fff", fontSize: 14 },
  title: { fontSize: 24, color: "#fff", textAlign: "center", marginBottom: 24 },
  input: { backgroundColor: "#fff", padding: 16, borderRadius: 8, fontSize: 18 },
  timeRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20 },
  timeInput: { backgroundColor: "#fff", borderRadius: 8, padding: 10, width: 70, textAlign: "center", fontSize: 22, fontWeight: "bold" },
  timeColon: { color: "#fff", fontSize: 28, marginHorizontal: 8 },
  sendButton: { backgroundColor: "#000", padding: 16, borderRadius: 8, marginTop: 24, alignItems: "center" },
  disabledButton: { backgroundColor: "#555" },
  sendButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  status: { color: "#fff", textAlign: "center", marginTop: 24 },
});
