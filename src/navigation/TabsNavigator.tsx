import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp, useTheme } from '@react-navigation/native';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { AnalyticsEventName } from '../constants/AnalyticsEventName';
import { useHaptics } from '../hooks';
import { CustomText } from '../ui/components';
import { HomeScreen, LibraryScreen } from '../ui/screens';
import { HandleFlashcardBottomSheet } from '../ui/sheets';
import { trackEvent } from '../utils/analytics';

export type TabsParamList = {
    Add: undefined;
    Home: undefined;
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

        const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => subscription.remove();
    }, [bottomSheetIsShown]);

    type TabRouteProp = RouteProp<TabsParamList, keyof TabsParamList>;

    const renderTabIcon = (route: TabRouteProp, focused: boolean, color: string) => {
        const iconSize = 26;

        if (route.name === 'Home') {
            return (
                <MaterialCommunityIcons
                    color={focused ? colors.primary300 : color}
                    name="home"
                    size={iconSize}
                    style={!focused ? { opacity: 0.6 } : undefined}
                />
            );
        }

        if (route.name === 'Library') {
            return (
                <MaterialCommunityIcons
                    color={focused ? colors.primary300 : color}
                    name="view-grid"
                    size={iconSize}
                    style={!focused ? { opacity: 0.6 } : undefined}
                />
            );
        }

        return null;
    };

    const plusStyle: ViewStyle = {
        transform: [{ scale: iconScale }],
    };

    const renderTabLabel = (route: TabRouteProp, focused: boolean, color: string) => (
        <CustomText
            style={[{ color, fontSize: 12 }, !focused && { opacity: 0.6 }]}
            weight={focused ? 'Bold' : 'Regular'}
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
                onChangeIndex={index => setBottomSheetIsShown(index === 0)}
            />

            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => renderTabIcon(route, focused, color),
                    tabBarLabel: ({ color, focused }) =>
                        route.name === 'Add' ? null : renderTabLabel(route, focused, color),
                    tabBarStyle: styles.tabBarStyle,
                })}
            >
                <Tab.Screen
                    component={HomeScreen}
                    name="Home"
                    listeners={{
                        tabPress: () => trackEvent(AnalyticsEventName.NAVIGATE_HOME),
                    }}
                />

                <Tab.Screen
                    component={View}
                    name="Add"
                    options={{
                        tabBarButton: props => (
                            <Pressable
                                {...props}
                                style={[props.style, styles.fabWrapper]}
                                onPressIn={animateIn}
                                onPressOut={animateOut}
                                onPress={() => {
                                    haptics.triggerHaptics(ImpactFeedbackStyle.Rigid);
                                    trackEvent(AnalyticsEventName.HANDLE_FLASHCARD_SHEET_OPEN, {
                                        mode: 'add',
                                        source: 'main_screen',
                                    });
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
                                    <Animated.View style={plusStyle}>
                                        <Entypo color={colors.card} name="plus" size={24} />
                                    </Animated.View>
                                </View>
                            </Pressable>
                        ),
                        tabBarIcon: () => null,
                        tabBarLabel: () => null,
                    }}
                />

                <Tab.Screen
                    component={LibraryScreen}
                    name="Library"
                    listeners={{
                        tabPress: () => trackEvent(AnalyticsEventName.NAVIGATE_LIBRARY),
                    }}
                />
            </Tab.Navigator>
        </>
    );
};

const styles = StyleSheet.create({
    fab: {
        alignItems: 'center',
        borderRadius: 35,
        borderWidth: 5,
        elevation: 6,
        height: 64,
        justifyContent: 'center',
        width: 64,
    },
    fabContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 30,
        elevation: 6,
        height: 60,
        justifyContent: 'center',
        position: 'absolute',
        top: -25,
        width: 60,
    },
    fabWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        top: -20,
    },
    tabBarStyle: {
        borderTopWidth: 0,
        height: 60,
        paddingBottom: 6,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
});

export default TabsNavigator;
