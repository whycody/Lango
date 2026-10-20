import { FC, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { EdgeInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL } from '../../../../constants/margins';
import { fontSize } from '../../../../constants/typography';
import { ThemeColors, TranslationKey } from '../../../../types';
import { CustomText } from '../../../../ui/components';
import { CustomTheme } from '../../../../ui/Theme';
import { isIOS } from '../../../../utils/deviceUtils';
import {
    ANDROID_HEIGHT,
    BACK_ICON_SIZE,
    IOS_HEIGHT,
    MORE_ICON_SIZE,
    PRESS_SCALE,
    PRESS_SCALE_DEFAULT,
    TITLE_HORIZONTAL_INSET,
    TITLE_OPACITY_RANGE,
    TITLE_SCROLL_END,
    TITLE_SCROLL_START,
    TITLE_TRANSLATE_Y_RANGE,
} from '../constants';

interface ScrollableTopBarProps {
    insets: EdgeInsets;
    scrollY: Animated.Value;
    title?: string;
    titleTx?: TranslationKey;
    onBackPress: () => void;
    onMoreOptionsPress?: () => void;
}

export const ScrollableTopBar: FC<ScrollableTopBarProps> = ({
    insets,
    onBackPress,
    onMoreOptionsPress,
    scrollY,
    title,
    titleTx,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors, insets), [colors, insets]);

    const backScale = useRef(new Animated.Value(PRESS_SCALE_DEFAULT)).current;
    const moreScale = useRef(new Animated.Value(PRESS_SCALE_DEFAULT)).current;

    const animatePressIn = (scale: Animated.Value) => {
        Animated.spring(scale, {
            toValue: PRESS_SCALE,
            useNativeDriver: true,
        }).start();
    };

    const animatePressOut = (scale: Animated.Value) => {
        Animated.spring(scale, {
            toValue: PRESS_SCALE_DEFAULT,
            useNativeDriver: true,
        }).start();
    };

    const handleBackPressIn = () => animatePressIn(backScale);
    const handleBackPressOut = () => animatePressOut(backScale);

    const handleMorePressIn = () => animatePressIn(moreScale);
    const handleMorePressOut = () => animatePressOut(moreScale);

    const titleOpacity = scrollY.interpolate({
        extrapolate: 'clamp',
        inputRange: [TITLE_SCROLL_START, TITLE_SCROLL_END],
        outputRange: TITLE_OPACITY_RANGE,
    });

    const titleTranslateY = scrollY.interpolate({
        extrapolate: 'clamp',
        inputRange: [TITLE_SCROLL_START, TITLE_SCROLL_END],
        outputRange: TITLE_TRANSLATE_Y_RANGE,
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
                    <Ionicons color={colors.white} name="chevron-back" size={BACK_ICON_SIZE} />
                </Animated.View>
            </Pressable>
            <Animated.View pointerEvents="none" style={[styles.titleContainer, titleAnimatedStyle]}>
                <CustomText
                    numberOfLines={1}
                    style={styles.title}
                    text={title}
                    tx={titleTx}
                    weight="Bold"
                />
            </Animated.View>
            {onMoreOptionsPress && (
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
                            size={MORE_ICON_SIZE}
                        />
                    </Animated.View>
                </Pressable>
            )}
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
            fontSize: fontSize.xxxl,
        },
        titleContainer: {
            alignItems: 'center',
            bottom: 0,
            justifyContent: 'center',
            left: TITLE_HORIZONTAL_INSET,
            position: 'absolute',
            right: TITLE_HORIZONTAL_INSET,
            top: insets.top,
        },
        topSpacer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            flexDirection: 'row',
            height: insets.top + (isIOS ? IOS_HEIGHT : ANDROID_HEIGHT),
            justifyContent: 'space-between',
            left: 0,
            paddingTop: insets.top,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 20,
        },
    });
