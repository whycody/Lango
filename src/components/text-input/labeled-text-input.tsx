import { Ref, useMemo } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../constants/margins';
import { ThemeColors, TranslationKey } from '../../types';
import { CustomText } from '../../ui/components/CustomText';
import { CustomTheme } from '../../ui/Theme';

interface LabeledTextInputProps extends TextInputProps {
    labelTx?: TranslationKey;
    inputRef?: Ref<TextInput>;
}

export const LabeledTextInput = ({
    inputRef,
    labelTx,
    multiline,
    style,
    ...textInputProps
}: LabeledTextInputProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);

    return (
        <>
            {labelTx && <CustomText style={styles.inputLabel} tx={labelTx} weight="SemiBold" />}
            <View style={styles.inputContainer}>
                <TextInput
                    autoCapitalize="sentences"
                    autoCorrect={true}
                    cursorColor={colors.primary300}
                    multiline={multiline}
                    placeholderTextColor={colors.white600}
                    ref={inputRef}
                    style={[styles.textInput, multiline && styles.multilineTextInput, style]}
                    {...textInputProps}
                />
            </View>
        </>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        inputContainer: {
            backgroundColor: colors.cardAccent,
            borderRadius: spacing.m,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.xs,
        },
        inputLabel: {
            color: colors.white300,
            fontSize: 13,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.l,
        },
        multilineTextInput: {
            minHeight: 70,
            textAlignVertical: 'top',
        },
        textInput: {
            color: colors.white,
            fontFamily: 'Montserrat-Regular',
            fontSize: 15,
            marginHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 14,
        },
    });
