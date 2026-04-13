import React, { FC } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { LanguageLevelRange } from '../../../types';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

type LanguageLevelItemProps = {
    code: string;
    desc: string;
    label: string;
    level: LanguageLevelRange;
    onPress: (level: LanguageLevelRange) => void;
    picked: boolean;
};

export const LanguageLevelItem: FC<LanguageLevelItemProps> = ({
    code,
    desc,
    label,
    level,
    onPress,
    picked,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    return (
        <>
            {level !== 1 && <View style={styles.divider} />}
            <LinearGradient
                colors={['transparent', picked ? colors.cardAccent300 : 'transparent']}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
            >
                <Pressable
                    android_ripple={{ color: colors.background }}
                    style={styles.root}
                    onPress={() => onPress(level)}
                >
                    <CustomText style={styles.code} weight={'Black'}>
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
            </LinearGradient>
        </>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        code: {
            color: colors.primary600,
            fontSize: 18,
            paddingRight: MARGIN_HORIZONTAL,
            width: 45,
        },
        content: {
            flex: 1,
        },
        desc: {
            color: colors.primary300,
            fontSize: 12,
        },
        divider: {
            backgroundColor: colors.background,
            height: 3,
            width: '100%',
        },
        root: {
            alignItems: 'center',
            flexDirection: 'row',
            padding: MARGIN_HORIZONTAL,
        },
        title: {
            color: colors.primary,
            fontSize: 13,
        },
    });
