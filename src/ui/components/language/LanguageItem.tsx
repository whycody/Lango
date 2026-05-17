import { memo } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { Language } from '../../../types';
import { CustomTheme } from '../../Theme';
import { CustomText, SquareFlag } from '..';

type LanguageItemProps = {
    checked: boolean;
    language: Language;
    onPress?: () => void;
    showIcon?: boolean;
    style?: StyleProp<ViewStyle>;
    onboarding: boolean;
};

export const LanguageItem = memo<LanguageItemProps>(
    ({ checked, language, onPress, onboarding, showIcon = true, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors, onboarding);

        return (
            <Pressable
                key={language.languageCode}
                android_ripple={onPress && { color: colors.background, foreground: true }}
                style={style}
                onPress={onPress}
            >
                <View style={[styles.container, checked && { borderColor: colors.primary600 }]}>
                    {showIcon && <Ionicons color={colors.blue} name={'language-sharp'} size={22} />}
                    <View style={styles.textContainer}>
                        <CustomText style={styles.text} weight={'SemiBold'}>
                            {language.languageName}
                        </CustomText>
                        <CustomText style={styles.translation}>
                            {language.languageInTargetLanguage}
                        </CustomText>
                    </View>
                    <SquareFlag languageCode={language.languageCode} />
                </View>
            </Pressable>
        );
    },
);

LanguageItem.displayName = 'LanguageItem';

const getStyles = (colors: CustomTheme['colors'], onboarding: boolean) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            backgroundColor: onboarding ? colors.card : colors.cardAccent600,
            borderColor: colors.cardAccent,
            borderRadius: spacing.m,
            borderWidth: 1,
            flexDirection: 'row',
            gap: 10,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 12,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 15,
        },
        icon: {
            marginLeft: 10,
            padding: 5,
            paddingRight: 0,
        },
        text: {
            color: colors.white,
            fontSize: 14,
        },
        textContainer: {
            flex: 1,
        },
        translation: {
            color: colors.white300,
            fontSize: 13,
        },
    });
