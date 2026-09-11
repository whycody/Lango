import { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { useHaptics } from '../../../../hooks';
import { WordsBundleWithOwnerInfo } from '../../../../types';
import { CustomTheme } from '../../../../ui/Theme';
import { BundleActionSlot, BundleCardItem } from '../../common/components';
import { ACTION_SLOT_SIZE } from '../../common/constants';

interface SearchBundleListItemProps {
    bundle: WordsBundleWithOwnerInfo;
    index: number;
    onInfoPress?: (bundle: WordsBundleWithOwnerInfo) => void;
    onPress?: (bundle: WordsBundleWithOwnerInfo) => void;
    style?: ViewStyle;
}

export const SearchBundleListItem = memo<SearchBundleListItemProps>(
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
                    <BundleActionSlot
                        buttonIcon="arrow-forward"
                        buttonIconColor={colors.primary300}
                        buttonIconSize={18}
                        ring={<View style={styles.ring} />}
                        onButtonPress={handleInfoPress}
                    />
                }
                onPress={() => onPress?.(bundle)}
            />
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        ring: {
            borderColor: colors.cardAccent300,
            borderRadius: 100,
            borderWidth: 2.5,
            height: ACTION_SLOT_SIZE,
            width: ACTION_SLOT_SIZE,
        },
    });
