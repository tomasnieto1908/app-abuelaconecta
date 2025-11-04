import { Ionicons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import MenuScreen from "./screens/MenuScreen"
import MessageScreen from "./screens/MessageScreen"
import ReminderScreen from "./screens/ReminderScreen"
import ViewRemindersScreen from "./screens/ViewRemindersScreen"
import WelcomeScreen from "./screens/WelcomeScreen"

export type RootStackParamList = {
  Welcome: undefined
  MainTabs: undefined
}

export type TabParamList = {
  Menu: undefined
  Message: undefined
  Reminder: undefined
  ViewReminders: undefined
}

const Stack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1033a3",
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#00ff11",
        tabBarInactiveTintColor: "#ffffff",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ focused, color, size }) => {
          const iconName: keyof typeof Ionicons.glyphMap = "home"

          return <Ionicons name={iconName} size={size || 24} color={color} />
        },
      }}
    >
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size || 24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Message"
        component={MessageScreen}
        options={{
          tabBarLabel: "Mensaje",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble" size={size || 24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Reminder"
        component={ReminderScreen}
        options={{
          tabBarLabel: "Recordatorio",
          tabBarIcon: ({ color, size }) => <Ionicons name="alarm" size={size || 24} color={color} />,
        }}
      />
      <Tab.Screen
        name="ViewReminders"
        component={ViewRemindersScreen}
        options={{
          tabBarLabel: "Ver Recordatorios",
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size || 24} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1033a3" />
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}


