import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../ui/screens/HomeScreen";
import LibraryScreen from "../ui/screens/LibraryScreen";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { Animated, BackHandler, Pressable, StyleSheet, View, } from "react-native";
import { useTranslation } from "react-i18next";
import CustomText from "../ui/components/CustomText";
import { useEffect, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { RouteProp, useTheme } from "@react-navigation/native";
import { trackEvent } from "../utils/analytics";
import { AnalyticsEventName } from "../constants/AnalyticsEventName";
import { HandleFlashcardBottomSheet } from "../ui/sheets";
import { useHaptics } from "../hooks/useHaptics";
import { ImpactFeedbackStyle } from "expo-haptics";

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

  const haptics = useHaptics();
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const handleBackPress = () => {
      if (bottomSheetIsShown) {
        flashcardBottomSheetRef.current?.dismiss();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => subscription.remove();
  }, [bottomSheetIsShown]);

  type TabRouteProp = RouteProp<TabsParamList, keyof TabsParamList>;

  const renderTabIcon = (
    route: TabRouteProp,
    focused: boolean,
    color: string
  ) => {
    const iconSize = 26;

    if (route.name === "Home") {
      return (
        <MaterialCommunityIcons
          name="home"
          size={iconSize}
          color={focused ? colors.primary300 : color}
          style={!focused ? { opacity: 0.6 } : undefined}
        />
      );
    }

    if (route.name === "Library") {
      return (
        <MaterialCommunityIcons
          name="view-grid"
          size={iconSize}
          color={focused ? colors.primary300 : color}
          style={!focused ? { opacity: 0.6 } : undefined}
        />
      );
    }

    return null;
  };

  const renderTabLabel = (
    route: TabRouteProp,
    focused: boolean,
    color: string
  ) => (
    <CustomText
      weight={focused ? "Bold" : "Regular"}
      style={[
        { color, fontSize: 12 },
        !focused && { opacity: 0.6 },
      ]}
    >
      {t(route.name.toLowerCase())}
    </CustomText>
  );

  const animateIn = () => {
    Animated.spring(iconScale, {
      toValue: 1.15,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(iconScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      <HandleFlashcardBottomSheet
        ref={flashcardBottomSheetRef}
        onChangeIndex={(index) => setBottomSheetIsShown(index === 0)}
      />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) =>
            renderTabIcon(route, focused, color),
          tabBarLabel: ({ focused, color }) =>
            route.name === "Add"
              ? null
              : renderTabLabel(route, focused, color),
          tabBarStyle: styles.tabBarStyle,
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          listeners={{
            tabPress: () =>
              trackEvent(AnalyticsEventName.NAVIGATE_HOME),
          }}
        />

        <Tab.Screen
          name="Add"
          component={View}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => null,
            tabBarButton: (props) => (
              <Pressable
                {...props}
                style={[props.style, styles.fabWrapper]}
                onPressIn={animateIn}
                onPressOut={animateOut}
                onPress={() => {
                  haptics.triggerHaptics(ImpactFeedbackStyle.Rigid)
                  trackEvent(
                    AnalyticsEventName.HANDLE_FLASHCARD_SHEET_OPEN,
                    { mode: "add", source: "main_screen" }
                  );
                  flashcardBottomSheetRef.current?.present();
                }}
              >
                <View
                  style={[
                    styles.fab,
                    {
                      backgroundColor: colors.primary300,
                      borderColor: colors.card,
                    },
                  ]}
                >
                  <Animated.View
                    style={{
                      transform: [{ scale: iconScale }],
                    }}
                  >
                    <Entypo
                      name="plus"
                      size={24}
                      color={colors.card}
                    />
                  </Animated.View>
                </View>
              </Pressable>
            ),
          }}
        />

        <Tab.Screen
          name="Library"
          component={LibraryScreen}
          listeners={{
            tabPress: () =>
              trackEvent(AnalyticsEventName.NAVIGATE_LIBRARY),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 60,
    paddingBottom: 6,
    paddingTop: 8,
    paddingHorizontal: 20,
    borderTopWidth: 0,
  },
  fabContainer: {
    position: "absolute",
    top: -25,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  fabWrapper: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    borderWidth: 5,
  },
});

export default TabsNavigator;