import { FC, memo, useMemo } from 'react';
import { Image, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { fontSize } from '../../../../constants/typography';
import { useHaptics } from '../../../../hooks';
import { BundleMemberWithUser, ThemeColors } from '../../../../types';
import { CustomText } from '../../../../ui/components';
import { CustomTheme } from '../../../../ui/Theme';
import {
    MEMBER_AVATAR_FALLBACK_ICON_SIZE,
    MEMBER_AVATAR_SIZE,
    MEMBER_ROW_ACTION_ICON_SIZE,
} from '../constants';

interface BundleMemberListItemProps {
    isCurrentUser: boolean;
    isFirst?: boolean;
    member: BundleMemberWithUser;
    onActionsPress?: (member: BundleMemberWithUser) => void;
    style?: StyleProp<ViewStyle>;
}

export const BundleMemberListItem: FC<BundleMemberListItemProps> = memo(
    ({ isCurrentUser, isFirst, member, onActionsPress, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = useMemo(() => getStyles(colors), [colors]);
        const { triggerHaptics } = useHaptics();
        const { t } = useTranslation();

        const handleActionsPress = () => {
            onActionsPress?.(member);
            triggerHaptics('light');
        };

        return (
            <View style={[styles.container, isFirst && styles.firstContainer, style]}>
                {member.userSummary.picture ? (
                    <Image
                        resizeMode="cover"
                        source={{ uri: member.userSummary.picture }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                        <Ionicons
                            color={colors.background}
                            name="person-sharp"
                            size={MEMBER_AVATAR_FALLBACK_ICON_SIZE}
                        />
                    </View>
                )}
                <View style={styles.textContainer}>
                    <CustomText
                        numberOfLines={1}
                        style={styles.name}
                        weight="SemiBold"
                        text={
                            isCurrentUser
                                ? t('bundle_details.members.you', { name: member.userSummary.name })
                                : member.userSummary.name
                        }
                    />
                    <CustomText
                        style={styles.role}
                        tx={`bundle_details.members.roles.${member.role}`}
                    />
                </View>
                {member.role !== 'owner' && onActionsPress && (
                    <Pressable
                        hitSlop={12}
                        style={styles.actionButton}
                        onPress={handleActionsPress}
                    >
                        <Ionicons
                            color={colors.white300}
                            name="ellipsis-horizontal"
                            size={MEMBER_ROW_ACTION_ICON_SIZE}
                        />
                    </Pressable>
                )}
            </View>
        );
    },
);

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        actionButton: {
            marginLeft: MARGIN_HORIZONTAL,
        },
        avatar: {
            borderRadius: spacing.m,
            height: MEMBER_AVATAR_SIZE,
            width: MEMBER_AVATAR_SIZE,
        },
        avatarFallback: {
            alignItems: 'center',
            backgroundColor: colors.primary300,
            justifyContent: 'center',
        },
        container: {
            alignItems: 'center',
            backgroundColor: colors.card,
            borderColor: colors.cardAccent,
            borderRadius: spacing.l,
            borderWidth: 1,
            flexDirection: 'row',
            marginTop: spacing.l,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: spacing.l,
        },
        firstContainer: {
            marginTop: spacing.m,
        },
        name: {
            color: colors.white,
            fontSize: fontSize.xl,
        },
        role: {
            color: colors.white300,
            fontSize: fontSize.s,
            marginTop: spacing.xxs,
        },
        textContainer: {
            flex: 1,
            marginLeft: spacing.l,
        },
    });
