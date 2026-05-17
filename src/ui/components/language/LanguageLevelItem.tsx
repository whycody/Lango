import React, { FC } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { LanguageLevelRange } from '../../../types';
import { getLanguageLevelColor } from '../../../utils/onboardingUtils';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

type LanguageLevelItemProps = {
    code: string;
    desc: string;
    label: string;
    level: LanguageLevelRange;
    onPress: (level: LanguageLevelRange) => void;
    picked: boolean;
    onboarding: boolean;
};

export const LanguageLevelItem: FC<LanguageLevelItemProps> = ({
    code,
    desc,
    label,
    level,
    onPress,
    onboarding,
    picked,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, onboarding);
    const color = getLanguageLevelColor(level, colors);

    return (
        <>
            <Pressable
                android_ripple={{ color: colors.background, foreground: true }}
                style={[styles.root, picked && { borderColor: colors.primary }]}
                onPress={() => onPress(level)}
            >
                <CustomText
                    weight={'Black'}
                    style={[
                        styles.code,
                        {
                            color,
                        },
                    ]}
                >
                    {code}
                </CustomText>
                <View style={styles.content}>
                    <CustomText style={styles.title} weight={'Bold'}>
                        {label}
                    </CustomText>
                    <CustomText style={styles.desc} weight={'Regular'}>
                        {desc}
                    </CustomText>
                </View>
            </Pressable>
        </>
    );
};

const getStyles = (colors: CustomTheme['colors'], onboarding: boolean) =>
    StyleSheet.create({
        code: {
            color: colors.white,
            fontSize: 18,
            paddingRight: MARGIN_HORIZONTAL,
            width: 45,
        },
        content: {
            flex: 1,
        },
        desc: {
            color: colors.white300,
            fontSize: 11,
        },
        divider: {
            backgroundColor: colors.background,
            height: 3,
            width: '100%',
        },
        root: {
            alignItems: 'center',
            backgroundColor: onboarding ? colors.card : colors.cardAccent600,
            borderColor: colors.cardAccent,
            borderRadius: spacing.m,
            borderWidth: 1,
            flexDirection: 'row',
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 12,
            padding: MARGIN_HORIZONTAL,
        },
        title: {
            color: colors.white,
            fontSize: 13,
        },
    });
