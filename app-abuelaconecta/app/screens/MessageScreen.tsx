// --- Importaciones ---
import { client, enviarMensaje, escucharMensajes, isConnected } from '@/hooks/mqttClient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
// -------------------

export default function MessageScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // --- Estado de Conexión ---
  const [connectionStatus, setConnectionStatus] = useState(isConnected());
  // --- Timeout del botón ---
  const [sending, setSending] = useState(false);

  // Escuchar mensajes MQTT y estado de conexión al montar la pantalla
  useEffect(() => {
    // 1. Escuchar mensajes
    escucharMensajes();

    // 2. Listeners de conexión
    const onConnect = () => setConnectionStatus(true);
    const onClose = () => setConnectionStatus(false);
    const onError = () => setConnectionStatus(false);

    client.on('connect', onConnect);
    client.on('close', onClose);
    client.on('error', onError);

    // Limpiar listeners al desmontar
    return () => {
      client.removeListener('connect', onConnect);
      client.removeListener('close', onClose);
      client.removeListener('error', onError);
    };
  }, []);

  const handleSendMessage = () => {
    if (!connectionStatus) {
      Alert.alert("Error", "No se puede enviar. Aún conectando al servidor...");
      return;
    }

    if (message.trim()) {
      // Bloquear el botón temporalmente
      setSending(true);

      // Enviar mensaje MQTT
      enviarMensaje(message);

      // Limpiar input
      setMessage("");

      // Mostrar mensaje de éxito
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Timeout para volver a habilitar botón
      setTimeout(() => setSending(false), 1500);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>← atrás</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Mensaje</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Escribe el mensaje"
          placeholderTextColor="#999"
          multiline
        />
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          (!connectionStatus || sending) && styles.sendButtonDisabled
        ]}
        onPress={handleSendMessage}
        disabled={!connectionStatus || sending}
      >
        <Text style={styles.sendButtonText}>
          {sending ? "Enviando..." : connectionStatus ? "Enviar" : "Conectando..."}
        </Text>
      </TouchableOpacity>

      {showSuccess && <Text style={styles.successText}>Se envió el mensaje</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1033a3", padding: 24 },
  backButton: { backgroundColor: "#000", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, alignSelf: "flex-start", marginBottom: 24 },
  backButtonText: { color: "#fff", fontSize: 14 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 24 },
  inputContainer: { backgroundColor: "#fff", borderRadius: 8, padding: 24, marginBottom: 24 },
  textInput: { fontSize: 18, backgroundColor: "#f5f5f5", padding: 16, borderRadius: 4, minHeight: 100, textAlignVertical: "top" },
  sendButton: { backgroundColor: "#000", padding: 16, borderRadius: 8, alignItems: "center" },
  sendButtonDisabled: { backgroundColor: "#555" },
  sendButtonText: { color: "#fff", fontSize: 20, fontWeight: "600" },
  successText: { color: "#0f0", fontSize: 20, fontWeight: "bold", textAlign: "center", marginTop: 16 },
});
