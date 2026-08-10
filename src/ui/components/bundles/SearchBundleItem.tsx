import { memo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { useHaptics } from '../../../hooks';
import { WordsBundleWithOwnerInfo } from '../../../types';
import { CustomTheme } from '../../Theme';
import { BundleCardItem } from './BundleCardItem';

interface SearchBundleItemProps {
    bundle: WordsBundleWithOwnerInfo;
    index: number;
    onInfoPress?: (bundle: WordsBundleWithOwnerInfo) => void;
    onPress?: (bundle: WordsBundleWithOwnerInfo) => void;
    style?: ViewStyle;
}

export const SearchBundleItem = memo<SearchBundleItemProps>(
    ({ bundle, index, onInfoPress, onPress, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);
        const { triggerHaptics } = useHaptics();

        const handleInfoPress = () => {
            onInfoPress?.(bundle);
            triggerHaptics('light');
        };

        return (
            <BundleCardItem
                creatorName={bundle.ownerName}
                flashcardsCount={bundle.flashcardsCount}
                index={index}
                ownerId={bundle.ownerId}
                style={style}
                title={bundle.title}
                actionSlot={
                    <View style={styles.actionSlot}>
                        <View pointerEvents="none" style={styles.ring} />
                        <Pressable hitSlop={8} style={styles.infoButton} onPress={handleInfoPress}>
                            <Ionicons color={colors.primary300} name="arrow-forward" size={18} />
                        </Pressable>
                    </View>
                }
                onPress={() => onPress?.(bundle)}
            />
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        actionSlot: {
            alignItems: 'center',
            height: 36,
            justifyContent: 'center',
            width: 36,
        },
        infoButton: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent600,
            borderRadius: 100,
            height: 28,
            justifyContent: 'center',
            width: 28,
        },
        ring: {
            borderColor: colors.cardAccent300,
            borderRadius: 100,
            borderWidth: 2.5,
            height: 36,
            position: 'absolute',
            width: 36,
        },
    });
