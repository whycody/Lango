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
    compact?: boolean;
    creatorId: string;
    flashcardsCount: number;
    name?: string;
    picture?: string;
    style?: StyleProp<ViewStyle>;
};

export const BundleCreatorInfo: FC<Props> = ({
    compact = false,
    creatorId,
    flashcardsCount,
    name,
    picture,
    style,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const { data: userSummary } = useUserSummaryQuery(name ? undefined : creatorId);

    const displayName = name ?? userSummary?.name;
    const displayPicture = picture ? picture : userSummary?.picture;

    if (!displayName) return null;

    return (
        <View style={[styles.row, style]}>
            {!compact &&
                (displayPicture ? (
                    <Image
                        resizeMode="cover"
                        source={{ uri: displayPicture }}
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
                ))}
            <CustomText
                numberOfLines={1}
                style={[styles.text, compact && styles.textCompact, { color: colors.white300 }]}
                weight="SemiBold"
            >
                {displayName}
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
    textCompact: {
        fontSize: 11,
    },
});
