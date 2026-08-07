import { memo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { useHaptics } from '../../../hooks';
import { BundleSearchResult } from '../../../types';
import { CustomTheme } from '../../Theme';
import { BundleCardItem } from './BundleCardItem';

interface SearchBundleItemProps {
    bundle: BundleSearchResult;
    index: number;
    onInfoPress?: (bundle: BundleSearchResult) => void;
    onPress?: (bundle: BundleSearchResult) => void;
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
                creatorName={bundle.creatorName}
                flashcardsCount={bundle.flashcardsCount}
                index={index}
                ownerId={bundle.ownerId}
                style={style}
                title={bundle.title}
                actionSlot={
                    <Pressable hitSlop={8} style={styles.infoButton} onPress={handleInfoPress}>
                        <Ionicons color={colors.primary300} name="arrow-forward" size={18} />
                    </Pressable>
                }
                onPress={() => onPress?.(bundle)}
            />
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        infoButton: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent600,
            borderRadius: 100,
            height: 36,
            justifyContent: 'center',
            width: 36,
        },
    });
