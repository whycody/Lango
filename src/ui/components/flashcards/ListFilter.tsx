import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface ListFilterProps extends Omit<TextInputProps, 'style'> {
    isSearching: boolean;
    onClear: () => void;
}

export const ListFilter = forwardRef<TextInput, ListFilterProps>(
    ({ isSearching, onClear, ...props }, ref) => {
        const { colors } = useTheme();
        const styles = getStyles(colors);

        return (
            <View style={styles.root}>
                <Ionicons
                    color={isSearching ? colors.primary600 : colors.primary300}
                    name="search-sharp"
                    size={22}
                    style={styles.icon}
                />
                <TextInput
                    cursorColor={colors.primary300}
                    ref={ref}
                    style={styles.textInput}
                    {...props}
                />
                {props.value && (
                    <Ionicons
                        color={colors.primary300}
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

const getStyles = (colors: any) =>
    StyleSheet.create({
        clearIcon: {
            marginLeft: 5,
            marginRight: 10,
        },
        icon: {
            marginLeft: 10,
            marginRight: 5,
        },
        root: {
            alignItems: 'center',
            backgroundColor: colors.background,
            flex: 1,
            flexDirection: 'row',
            marginVertical: 15,
        },
        textInput: {
            backgroundColor: colors.background,
            color: colors.primary300,
            flex: 1,
            fontSize: 18,
            height: 50,
        },
    });
