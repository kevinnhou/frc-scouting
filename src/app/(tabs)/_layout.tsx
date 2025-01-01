import { Tabs } from "expo-router";
import { Binoculars, House, Timer } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#85BEFE",
        tabBarStyle: {
          backgroundColor: "#262628",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <House color={color} />,
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: "Match",
          tabBarIcon: ({ color }) => <Timer color={color} />,
        }}
      />
      <Tabs.Screen
        name="pit"
        options={{
          title: "Pit",
          tabBarIcon: ({ color }) => <Binoculars color={color} />,
        }}
      />
    </Tabs>
  );
}
