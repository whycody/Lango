import { forwardRef } from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { spacing } from '../../../constants/margins';
import { CustomTheme } from '../../Theme';

interface ListFilterProps extends Omit<TextInputProps, 'style'> {
    isSearching: boolean;
    onClear: () => void;
    styleRoot?: StyleProp<ViewStyle>;
}

export const ListFilter = forwardRef<TextInput, ListFilterProps>(
    ({ isSearching, onClear, styleRoot, ...props }, ref) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);
        const { t } = useTranslation();

        return (
            <View style={[styles.root, styleRoot]}>
                <Ionicons
                    color={isSearching ? colors.white300 : colors.white300}
                    name="search-sharp"
                    size={22}
                    style={styles.icon}
                />
                <TextInput
                    cursorColor={colors.white300}
                    placeholder={t('searchFlashcard')}
                    placeholderTextColor={colors.white600}
                    ref={ref}
                    style={styles.textInput}
                    {...props}
                />
                {props.value && (
                    <Ionicons
                        color={colors.white}
                        name="close"
                        size={22}
                        style={styles.clearIcon}
                        onPress={onClear}
                    />
                )}
            </View>
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        clearIcon: {
            alignSelf: 'center',
            paddingLeft: 5,
            paddingRight: 10,
            paddingVertical: 13,
        },
        icon: {
            marginLeft: 10,
            marginRight: 5,
        },
        root: {
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: spacing.m,
            flex: 1,
            flexDirection: 'row',
            height: 45,
        },
        textInput: {
            backgroundColor: colors.card,
            borderRadius: spacing.m,
            color: colors.white,
            flex: 1,
            fontSize: 18,
            height: 44,
        },
    });
