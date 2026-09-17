import { FC, Ref, useMemo } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../constants/margins';
import { fontFamily, fontSize } from '../../constants/typography';
import { ThemeColors, TranslationKey } from '../../types';
import { CustomText } from '../../ui/components/CustomText';
import { CustomTheme } from '../../ui/Theme';

interface LabeledTextInputProps extends TextInputProps {
    labelTx?: TranslationKey;
    inputRef?: Ref<TextInput>;
}

const MULTILINE_MIN_HEIGHT = 70;

export const LabeledTextInput: FC<LabeledTextInputProps> = ({
    inputRef,
    labelTx,
    multiline,
    style,
    ...textInputProps
}) => {
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
            fontSize: fontSize.m,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.l,
        },
        multilineTextInput: {
            minHeight: MULTILINE_MIN_HEIGHT,
            textAlignVertical: 'top',
        },
        textInput: {
            color: colors.white,
            fontFamily: fontFamily.Regular,
            fontSize: fontSize.xl,
            marginHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 14,
        },
    });
