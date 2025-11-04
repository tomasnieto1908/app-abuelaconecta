import { View, Text, Button, StyleSheet,TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';


export default function MenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menú Principal</Text>
   
      <TouchableOpacity onPress={() => router.push('screens/MessageScreen')}><Text style={styles.button}>Mensaje</Text></TouchableOpacity>

    <TouchableOpacity onPress={() => router.push('screens/ReminderScreen')}><Text style={styles.button}>Recordatorio</Text></TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('screens/ViewRemindersScreen')}><Text style={styles.button}>Ver Recordatorios</Text></TouchableOpacity>

<TouchableOpacity onPress={() => router.push('/')}><Text style={styles.button}>Volver al Inicio</Text></TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1033a3' },
  title: { fontSize: 35, color: '#fff', marginBottom: 20 },
   button: {marginTop: 20 ,  paddingVertical: 20, paddingHorizontal: 40, backgroundColor: "white", color: "black" ,fontSize: 24 }});

