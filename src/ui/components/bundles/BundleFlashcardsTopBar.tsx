import { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { EdgeInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { isIOS } from '../../../utils/deviceUtils';
import { CustomTheme } from '../../Theme';
import { CustomText } from '../CustomText';

const TITLE_SCROLL_START = 40;
const TITLE_SCROLL_END = 80;

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
        Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }).start();
    };

    const animatePressOut = (scale: Animated.Value) => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

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

    return (
        <Animated.View style={styles.topSpacer}>
            <Pressable
                hitSlop={12}
                style={styles.backButton}
                onPress={onBackPress}
                onPressIn={() => animatePressIn(backScale)}
                onPressOut={() => animatePressOut(backScale)}
            >
                <Animated.View style={{ transform: [{ scale: backScale }] }}>
                    <Ionicons color={colors.white} name="chevron-back" size={26} />
                </Animated.View>
            </Pressable>
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.titleContainer,
                    {
                        opacity: titleOpacity,
                        transform: [{ translateY: titleTranslateY }],
                    },
                ]}
            >
                <CustomText numberOfLines={1} style={styles.title} weight="Bold">
                    {title}
                </CustomText>
            </Animated.View>
            <Pressable
                hitSlop={12}
                style={styles.moreButton}
                onPress={onMoreOptionsPress}
                onPressIn={() => animatePressIn(moreScale)}
                onPressOut={() => animatePressOut(moreScale)}
            >
                <Animated.View style={{ transform: [{ scale: moreScale }] }}>
                    <Ionicons color={colors.white} name="ellipsis-horizontal" size={22} />
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
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
            left: 56,
            position: 'absolute',
            right: 56,
            top: insets.top,
        },
        topSpacer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            flexDirection: 'row',
            height: isIOS ? 44 + insets.top : insets.top + 56,
            justifyContent: 'space-between',
            left: 0,
            paddingTop: insets.top,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 20,
        },
    });
