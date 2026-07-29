import React, { FC } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { spacing } from '../../../constants/margins';
import { useUserSummaryQuery } from '../../../hooks';
import { CustomTheme } from '../../Theme';
import { CustomText } from '../CustomText';

type Props = {
    creatorId: string;
    flashcardsCount: number;
    style?: StyleProp<ViewStyle>;
};

export const BundleCreatorInfo: FC<Props> = ({ creatorId, flashcardsCount, style }) => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const { data: userSummary } = useUserSummaryQuery(creatorId);

    if (!userSummary) return null;

    return (
        <View style={[styles.row, style]}>
            {userSummary.picture ? (
                <Image
                    resizeMode="cover"
                    source={{ uri: userSummary.picture }}
                    style={styles.avatar}
                />
            ) : (
                <View
                    style={[
                        styles.avatar,
                        styles.avatarFallback,
                        { backgroundColor: colors.primary300 },
                    ]}
                >
                    <Ionicons color={colors.background} name="person-sharp" size={14} />
                </View>
            )}
            <CustomText style={[styles.text, { color: colors.white300 }]} weight="SemiBold">
                {userSummary.name}
                {' • '}
                {t('bundle_details.flashcards_count', { count: flashcardsCount })}
            </CustomText>
        </View>
    );
};

const styles = StyleSheet.create({
    avatar: {
        borderRadius: spacing.m,
        height: 22,
        width: 22,
    },
    avatarFallback: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.m,
        marginTop: spacing.s,
    },
    text: {
        fontSize: 13,
    },
});
