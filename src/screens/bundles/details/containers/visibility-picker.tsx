import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { WordsBundleVisibility } from '../../../../types';
import { Header } from '../../../../ui/components';
import { CustomTheme } from '../../../../ui/Theme';
import { VisibilityPickerListItem } from '../components';
import { BUNDLE_VISIBILITY_OPTIONS } from '../constants';
import { BundleVisibilityOption } from '../types';

const keyExtractor = (item: BundleVisibilityOption) => item.visibility;

interface VisibilityPickerProps {
    style?: ViewStyle;
    value: WordsBundleVisibility;
    onSelect: (visibility: WordsBundleVisibility) => void;
}

export const VisibilityPicker = ({ onSelect, style, value }: VisibilityPickerProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);

    const renderItem = useCallback(
        ({ item }: { item: BundleVisibilityOption }) => (
            <VisibilityPickerListItem
                isSelected={value === item.visibility}
                item={item}
                onSelect={onSelect}
            />
        ),
        [onSelect, value],
    );

    return (
        <View style={style}>
            <Header
                style={styles.header}
                subtitleTx="bundle_details.visibility.desc"
                titleTx="bundle_details.visibility.title"
            />
            <FlatList
                data={BUNDLE_VISIBILITY_OPTIONS}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                scrollEnabled={false}
                style={styles.list}
            />
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        header: {
            paddingBottom: spacing.xl,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: spacing.l,
        },
        list: {
            backgroundColor: colors.card,
        },
    });
