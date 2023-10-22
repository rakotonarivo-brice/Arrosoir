import 'react-native-reanimated';
import "react-native-gesture-handler";
import { StyleSheet, Text, View } from "react-native";
import HomeView from "./src/views/homeView";
import LogView from "./src/views/logView";
import RegisterView from "./src/views/registerView";
import EmailCheckView from "./src/views/emailCheckView";
import DashboardView from "./src/views/dashboardView";
import cardDetailView from "./src/views/cardDetailView";
import ProfileView from "./src/views/profileView";
import SettingsView from "./src/views/settingsView";
import ArticlesView from "./src/views/articlesView";

import { ColorPalette } from "./src/styles/colors";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarShowLabel: false }}>
      <Tab.Screen
        name="Home"
        component={DashboardView}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Ionicons
                name={"home"}
                size={25}
                color={focused ? ColorPalette.greenify : ColorPalette.textGrey}
              />
              <Text
                style={{
                  color: focused
                    ? ColorPalette.greenify
                    : ColorPalette.textGrey,
                }}
              >
                Accueil
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Articles"
        component={ArticlesView}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Ionicons
                name={"reader"}
                size={25}
                color={focused ? ColorPalette.greenify : ColorPalette.textGrey}
              />
              <Text
                style={{
                  color: focused
                    ? ColorPalette.greenify
                    : ColorPalette.textGrey,
                }}
              >
                Articles
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileView}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Ionicons
                name={"person-circle"}
                size={25}
                color={focused ? ColorPalette.greenify : ColorPalette.textGrey}
              />
              <Text
                style={{
                  color: focused
                    ? ColorPalette.greenify
                    : ColorPalette.textGrey,
                }}
              >
                Profile
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsView}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Ionicons
                name={"cog"}
                size={25}
                color={focused ? ColorPalette.greenify : ColorPalette.textGrey}
              />
              <Text
                style={{
                  color: focused
                    ? ColorPalette.greenify
                    : ColorPalette.textGrey,
                }}
              >
                Paramètres
              </Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Log"
          component={LogView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Reg"
          component={RegisterView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Email"
          component={EmailCheckView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Tabs"
          component={MyTabs}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="CardDetail"
          component={cardDetailView}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
