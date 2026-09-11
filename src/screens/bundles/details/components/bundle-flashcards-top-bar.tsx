import { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { EdgeInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL } from '../../../../constants/margins';
import { ThemeColors } from '../../../../types';
import { CustomText } from '../../../../ui/components/CustomText';
import { CustomTheme } from '../../../../ui/Theme';
import { isIOS } from '../../../../utils/deviceUtils';
import {
    TITLE_SCROLL_END,
    TITLE_SCROLL_START,
    TOP_BAR_ANDROID_HEIGHT,
    TOP_BAR_BACK_ICON_SIZE,
    TOP_BAR_IOS_HEIGHT,
    TOP_BAR_MORE_ICON_SIZE,
    TOP_BAR_PRESS_SCALE,
    TOP_BAR_TITLE_HORIZONTAL_INSET,
} from '../constants';

interface BundleFlashcardsTopBarProps {
    insets: EdgeInsets;
    scrollY: Animated.Value;
    title: string;
    onBackPress: () => void;
    onMoreOptionsPress: () => void;
}

export const BundleFlashcardsTopBar = ({
    insets,
    onBackPress,
    onMoreOptionsPress,
    scrollY,
    title,
}: BundleFlashcardsTopBarProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, insets);

    const backScale = useRef(new Animated.Value(1)).current;
    const moreScale = useRef(new Animated.Value(1)).current;

    const animatePressIn = (scale: Animated.Value) => {
        Animated.spring(scale, { toValue: TOP_BAR_PRESS_SCALE, useNativeDriver: true }).start();
    };

    const animatePressOut = (scale: Animated.Value) => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    const handleBackPressIn = () => animatePressIn(backScale);
    const handleBackPressOut = () => animatePressOut(backScale);

    const handleMorePressIn = () => animatePressIn(moreScale);
    const handleMorePressOut = () => animatePressOut(moreScale);

    const titleOpacity = scrollY.interpolate({
        extrapolate: 'clamp',
        inputRange: [TITLE_SCROLL_START, TITLE_SCROLL_END],
        outputRange: [0, 1],
    });

    const titleTranslateY = scrollY.interpolate({
        extrapolate: 'clamp',
        inputRange: [TITLE_SCROLL_START, TITLE_SCROLL_END],
        outputRange: [8, 0],
    });

    const titleAnimatedStyle = {
        opacity: titleOpacity,
        transform: [{ translateY: titleTranslateY }],
    };

    return (
        <Animated.View style={styles.topSpacer}>
            <Pressable
                hitSlop={12}
                style={styles.backButton}
                onPress={onBackPress}
                onPressIn={handleBackPressIn}
                onPressOut={handleBackPressOut}
            >
                <Animated.View style={{ transform: [{ scale: backScale }] }}>
                    <Ionicons
                        color={colors.white}
                        name="chevron-back"
                        size={TOP_BAR_BACK_ICON_SIZE}
                    />
                </Animated.View>
            </Pressable>
            <Animated.View pointerEvents="none" style={[styles.titleContainer, titleAnimatedStyle]}>
                <CustomText numberOfLines={1} style={styles.title} text={title} weight="Bold" />
            </Animated.View>
            <Pressable
                hitSlop={12}
                style={styles.moreButton}
                onPress={onMoreOptionsPress}
                onPressIn={handleMorePressIn}
                onPressOut={handleMorePressOut}
            >
                <Animated.View style={{ transform: [{ scale: moreScale }] }}>
                    <Ionicons
                        color={colors.white}
                        name="ellipsis-horizontal"
                        size={TOP_BAR_MORE_ICON_SIZE}
                    />
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

const getStyles = (colors: ThemeColors, insets: EdgeInsets) =>
    StyleSheet.create({
        backButton: {
            marginLeft: MARGIN_HORIZONTAL,
        },
        moreButton: {
            marginRight: MARGIN_HORIZONTAL,
        },
        title: {
            color: colors.white,
            fontSize: 17,
        },
        titleContainer: {
            alignItems: 'center',
            bottom: 0,
            justifyContent: 'center',
            left: TOP_BAR_TITLE_HORIZONTAL_INSET,
            position: 'absolute',
            right: TOP_BAR_TITLE_HORIZONTAL_INSET,
            top: insets.top,
        },
        topSpacer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            flexDirection: 'row',
            height: isIOS ? TOP_BAR_IOS_HEIGHT + insets.top : insets.top + TOP_BAR_ANDROID_HEIGHT,
            justifyContent: 'space-between',
            left: 0,
            paddingTop: insets.top,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 20,
        },
    });
