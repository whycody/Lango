import { memo } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { Language } from '../../../types';
import { CustomTheme } from '../../Theme';
import { CustomText, SquareFlag } from '..';

type LanguageItemProps = {
    checked: boolean;
    index: number;
    language: Language;
    onPress?: () => void;
    showIcon?: boolean;
    style?: StyleProp<ViewStyle>;
};

export const LanguageItem = memo<LanguageItemProps>(
    ({ checked, index, language, onPress, showIcon = true, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);

        return (
            <Pressable
                key={language.languageCode}
                android_ripple={onPress && { color: colors.background, foreground: true }}
                style={style}
                onPress={onPress}
            >
                {index !== 0 && <View style={styles.divider} />}
                <LinearGradient
                    colors={['transparent', checked ? colors.cardAccent600 : 'transparent']}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                >
                    <View style={styles.container}>
                        {showIcon && (
                            <Ionicons color={colors.primary600} name={'language-sharp'} size={22} />
                        )}
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
                </LinearGradient>
            </Pressable>
        );
    },
);

LanguageItem.displayName = 'LanguageItem';

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 15,
        },
        divider: {
            backgroundColor: colors.background,
            height: 3,
            width: '100%',
        },
        icon: {
            marginLeft: 10,
            padding: 5,
            paddingRight: 0,
        },
        text: {
            color: colors.primary,
            fontSize: 14,
        },
        textContainer: {
            flex: 1,
        },
        translation: {
            color: colors.primary300,
            fontSize: 13,
        },
    });
