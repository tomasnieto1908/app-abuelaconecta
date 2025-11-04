import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function MessageScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AbuelaConecta</Text>
      <TouchableOpacity title="inicio" onPress={() => router.push('screens/MenuScreen')} >  <Text style={styles.button}>Inicio</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1033a3' },
  title: { fontSize: 34, color: '#fff', marginBottom: 50 },
  button: {marginTop: 20 ,  paddingVertical: 20, paddingHorizontal: 40, backgroundColor: "white", color: "black",fontSize: 24 }});
