import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import LibraryScreen from "../screens/LibraryScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet } from 'react-native';
import { useTranslation } from "react-i18next";
import CustomText from "../components/CustomText";

export type TabsParamList = {
  Home: undefined;
  Library: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

const TabsNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const iconSize = route.name === 'Home' ? 28 : 26;
          let iconName = route.name === 'Home' ? 'home' : 'view-grid';
          return <MaterialCommunityIcons name={iconName} size={iconSize} style={!focused && { opacity: 0.6 }} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => (
          <CustomText weight={focused ? 'Bold' : 'Regular'} style={[{ color, fontSize: 12 }, !focused && { opacity: 0.6 }]}>
            {t(route.name.toLowerCase())}
          </CustomText>
        ),
        tabBarStyle: styles.tabBarStyle,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};


const styles = StyleSheet.create({
  tabBarStyle: {
    height: 58,
    paddingBottom: 5,
    paddingTop: 8,
    paddingHorizontal: 20,
    borderTopWidth: 0,
  },
});

export default TabsNavigator;