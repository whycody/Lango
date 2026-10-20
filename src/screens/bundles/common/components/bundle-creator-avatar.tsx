import { FC, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { spacing } from '../../../../constants/margins';
import { ThemeColors } from '../../../../types';
import { CustomTheme } from '../../../../ui/Theme';
import {
    BUNDLE_CREATOR_AVATAR_FALLBACK_ICON_SIZE,
    BUNDLE_CREATOR_INFO_AVATAR_SIZE,
} from '../constants';

interface BundleCreatorAvatarProps {
    picture?: string;
}

export const BundleCreatorAvatar: FC<BundleCreatorAvatarProps> = ({ picture }) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);

    if (picture) {
        return <Image resizeMode="cover" source={{ uri: picture }} style={styles.avatar} />;
    }

    return (
        <View style={[styles.avatar, styles.avatarFallback]}>
            <Ionicons
                color={colors.background}
                name="person-sharp"
                size={BUNDLE_CREATOR_AVATAR_FALLBACK_ICON_SIZE}
            />
        </View>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        avatar: {
            borderRadius: spacing.m,
            height: BUNDLE_CREATOR_INFO_AVATAR_SIZE,
            width: BUNDLE_CREATOR_INFO_AVATAR_SIZE,
        },
        avatarFallback: {
            alignItems: 'center',
            backgroundColor: colors.primary300,
            justifyContent: 'center',
        },
    });
