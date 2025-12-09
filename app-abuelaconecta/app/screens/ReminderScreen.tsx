import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { client, isConnected } from "@/hooks/mqttClient";
import { useRouter } from "expo-router";

interface Reminder {
  id: string;
  text: string;
  hour: number;
  minute: number;
}

const SERVER_URL = "http://10.56.2.27:5000";  // ← TU IP REAL

export default function ReminderMqttScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [hour, setHour] = useState("17");
  const [minute, setMinute] = useState("00");
  const [connectionStatus, setConnectionStatus] = useState(isConnected());

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
      Alert.alert("Error", "Hora inválida.");
      return;
    }

    const id = `${Date.now()}`;

    const newReminder: Reminder = {
      id,
      text: message,
      hour: h,
      minute: m,
    };

    try {
      const res = await fetch(`${SERVER_URL}/save-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReminder),
      });

      if (!res.ok) {
        throw new Error("Error guardando en el servidor");
      }

      Alert.alert("✅ Guardado", `Recordatorio diario a las ${hour}:${minute}`);
      router.push("/screens/ViewRemindersScreen");

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "El servidor no respondió. Revisá si está encendido.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← atrás</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Nuevo Recordatorio Diario</Text>

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

      <TouchableOpacity style={styles.sendButton} onPress={handleSchedule}>
        <Text style={styles.sendButtonText}>Guardar recordatorio</Text>
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
  sendButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  status: { color: "#fff", textAlign: "center", marginTop: 24 },
});
