import React, { FC, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { spacing } from '../../../../constants/margins';
import { useUserSummaryQuery } from '../../../../hooks';
import { ThemeColors } from '../../../../types';
import { CustomText } from '../../../../ui/components/CustomText';
import { CustomTheme } from '../../../../ui/Theme';
import { BUNDLE_CREATOR_INFO_TEXT_LINE_HEIGHT } from '../constants';
import { BundleCreatorAvatar } from './bundle-creator-avatar';

interface BundleCreatorInfoProps {
    compact?: boolean;
    creatorId: string;
    flashcardsCount: number;
    name?: string;
    picture?: string;
    style?: StyleProp<ViewStyle>;
}

export const BundleCreatorInfo: FC<BundleCreatorInfoProps> = ({
    compact = false,
    creatorId,
    flashcardsCount,
    name,
    picture,
    style,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);
    const { data: userSummary } = useUserSummaryQuery(name ? undefined : creatorId);

    const displayName = name ?? userSummary?.name;
    const displayPicture = picture ? picture : userSummary?.picture;

    if (!displayName) return null;

    return (
        <View style={[styles.row, style]}>
            {!compact && <BundleCreatorAvatar picture={displayPicture} />}
            <CustomText
                numberOfLines={1}
                style={[styles.text, compact && styles.textCompact]}
                tx="bundle_details.creator_info"
                txOptions={{ count: flashcardsCount, name: displayName }}
                weight="SemiBold"
            />
        </View>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        row: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: spacing.m,
            marginTop: spacing.xs,
        },
        text: {
            color: colors.white300,
            fontSize: 13,
            lineHeight: BUNDLE_CREATOR_INFO_TEXT_LINE_HEIGHT,
        },
        textCompact: {
            fontSize: 11,
        },
    });
