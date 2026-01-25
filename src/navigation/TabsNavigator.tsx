import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../ui/screens/HomeScreen";
import LibraryScreen from "../ui/screens/LibraryScreen";
import { Foundation, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BackHandler, StyleSheet, View } from 'react-native';
import { useTranslation } from "react-i18next";
import CustomText from "../ui/components/CustomText";
import HandleFlashcardBottomSheet from "../ui/sheets/HandleFlashcardBottomSheet";
import { useEffect, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import ResourcesScreen from "../ui/screens/ResourcesScreen";

export type TabsParamList = {
  Home: undefined;
  Resources: undefined;
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

  return (
    <>
      <HandleFlashcardBottomSheet
        ref={flashcardBottomSheetRef}
        onChangeIndex={(index) => setBottomSheetIsShown(index == 0)}
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            const iconSize = route.name === 'Home' ? 28 : 26;
            let iconName = route.name === 'Home' ? 'home' : route.name == 'Add' ? 'plus' : route.name == 'Resources' ?
              'folder-open-sharp' : 'view-grid';
            const IconFamily = route.name === 'Add' ? Foundation : route.name === 'Resources' ? Ionicons : MaterialCommunityIcons;
            return <IconFamily
              name={iconName}
              size={iconSize}
              style={[!focused && { opacity: 0.6 }]}
              color={!focused ? color : colors.primary300}
            />
          },
          tabBarLabel: ({ focused, color }) => (
            <CustomText
              weight={focused ? 'Bold' : 'Regular'}
              style={[{ color, fontSize: 12 }, !focused && { opacity: 0.6, fontSize: 12, marginBottom: 1 }]}
            >
              {t(route.name.toLowerCase())}
            </CustomText>
          ),
          tabBarStyle: [styles.tabBarStyle],
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
        <Tab.Screen name="Resources" component={ResourcesScreen} options={{ headerShown: false }}/>
        <Tab.Screen name="Add" component={View} listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            flashcardBottomSheetRef.current?.present();
          },
        })}
        />
        <Tab.Screen name="Library" component={LibraryScreen} options={{ headerShown: false }}/>
      </Tab.Navigator>
    </>
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