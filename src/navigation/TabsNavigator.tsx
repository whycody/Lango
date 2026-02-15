import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../ui/screens/HomeScreen";
import LibraryScreen from "../ui/screens/LibraryScreen";
import { Foundation, MaterialCommunityIcons } from "@expo/vector-icons";
import { BackHandler, StyleSheet, View } from 'react-native';
import { useTranslation } from "react-i18next";
import CustomText from "../ui/components/CustomText";
import HandleFlashcardBottomSheet from "../ui/sheets/HandleFlashcardBottomSheet";
import { useEffect, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { RouteProp, useTheme } from "@react-navigation/native";
import { trackEvent } from "../utils/analytics";
import { AnalyticsEventName } from "../constants/AnalyticsEventName";

export type TabsParamList = {
  Home: undefined;
  Add: undefined;
  Library: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

const TabsNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const flashcardBottomSheetRef = useRef<BottomSheetModal>(null);
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);

  useEffect(() => {
    const handleBackPress = () => {
      if (bottomSheetIsShown) {
        flashcardBottomSheetRef.current?.dismiss();
        return true;
      }
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => subscription.remove();
  }, [bottomSheetIsShown]);

  type TabRouteProp = RouteProp<TabsParamList, keyof TabsParamList>;

  const renderTabIcon = (route: TabRouteProp, focused: boolean, color: string) => {
    const iconSize = route.name === 'Home' ? 28 : 26;
    const iconName =
      route.name === 'Home'
        ? 'home'
        : route.name === 'Add'
          ? 'plus'
          : 'view-grid';
    const IconFamily = route.name === 'Add' ? Foundation : MaterialCommunityIcons;

    return (
      <IconFamily
        name={iconName as any}
        size={iconSize}
        style={[!focused && { opacity: 0.6 }]}
        color={!focused ? color : colors.primary300}
      />
    );
  };

  const renderTabLabel = (route: TabRouteProp, focused: boolean, color: string) => (
    <CustomText
      weight={focused ? 'Bold' : 'Regular'}
      style={[
        { color, fontSize: 12 },
        !focused && { opacity: 0.6, fontSize: 12, marginBottom: 1 },
      ]}
    >
      {t(route.name.toLowerCase())}
    </CustomText>
  );

  const handleTabPress = (route: TabRouteProp) => {
    const eventName =
      route.name === 'Home'
        ? AnalyticsEventName.NAVIGATE_HOME
        : route.name === 'Library'
          ? AnalyticsEventName.NAVIGATE_LIBRARY
          : AnalyticsEventName.START_SESSION_SHEET_OPEN;

    trackEvent(eventName);
  };

  return (
    <>
      <HandleFlashcardBottomSheet
        ref={flashcardBottomSheetRef}
        onChangeIndex={(index) => setBottomSheetIsShown(index == 0)}
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) =>
            renderTabIcon(route, focused, color),
          tabBarLabel: ({ focused, color }) =>
            renderTabLabel(route, focused, color),
          tabBarStyle: [styles.tabBarStyle],
          headerShown: false
        })}
        screenListeners={({ route }) => ({
          tabPress: (e) => handleTabPress(route),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen}/>
        <Tab.Screen
          name="Add"
          component={View}
          listeners={() => ({
            tabPress: (e) => {
              trackEvent(AnalyticsEventName.HANDLE_FLASHCARD_SHEET_OPEN, { mode: 'add', source: 'main_screen' });
              e.preventDefault();
              flashcardBottomSheetRef.current?.present();
            },
          })}
        />
        <Tab.Screen name="Library" component={LibraryScreen}/>
      </Tab.Navigator>
    </>
  );
}

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