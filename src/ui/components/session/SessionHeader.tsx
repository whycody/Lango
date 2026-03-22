import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { SessionLength } from '../../../store';
import { CustomText } from '..';

type SessionHeaderProps = {
    cardsSetLength: number;
    length: SessionLength;
    onSessionExit: () => void;
    onSettingsPressed: () => void;
    progress: number;
};

export const SessionHeader: FC<SessionHeaderProps> = ({
    cardsSetLength,
    length,
    onSessionExit,
    onSettingsPressed,
    progress,
}) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { t } = useTranslation();

    return (
        <View style={styles.headerContainer}>
            <MaterialCommunityIcons
                color={colors.primary300}
                name={'exit-to-app'}
                size={21}
                style={[{ transform: [{ rotate: '180deg' }] }, styles.icon]}
                onPress={onSessionExit}
            />
            <CustomText style={styles.progressText} weight={'SemiBold'}>
                {`${progress}`}
            </CustomText>
            <CustomText style={styles.title} weight="SemiBold">
                {length === 1
                    ? t('shortSession')
                    : length === 2
                      ? t('mediumSession')
                      : t('longSession')}
            </CustomText>
            <CustomText style={styles.progressText} weight={'SemiBold'}>
                {`${cardsSetLength - progress}`}
            </CustomText>
            <Ionicons
                color={colors.primary300}
                name={'settings-outline'}
                size={21}
                style={styles.icon}
                onPress={onSettingsPressed}
            />
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        headerContainer: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 15,
        },
        icon: {
            height: '100%',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 5,
        },
        progressText: {
            color: colors.primary600,
            textAlign: 'center',
            width: 30,
        },
        title: {
            color: colors.primary,
            fontSize: 15,
            paddingHorizontal: 10,
            textAlign: 'center',
            textTransform: 'uppercase',
        },
    });
