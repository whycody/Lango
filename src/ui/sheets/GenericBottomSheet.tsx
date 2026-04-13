import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';

import { BOTTOM_SHEET_GRABBER_OPTIONS } from '../../constants/Common';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { ActionButton } from '../components/ActionButton';
import { CustomText } from '../components/CustomText';
import { CustomTheme } from '../Theme';

type GenericBottomSheetProps = {
    allowDismiss?: boolean;
    children?: ReactNode;
    description?: string;
    onPrimaryButtonPress?: () => void;
    onSecondaryButtonPress?: () => void;
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
    primaryButtonEnabled?: boolean;
    sheetName: string;
    title?: string;
};

export const GenericBottomSheet = (props: GenericBottomSheetProps) => {
    const {
        allowDismiss = true,
        children,
        description,
        onPrimaryButtonPress,
        onSecondaryButtonPress,
        primaryActionLabel,
        primaryButtonEnabled,
        secondaryActionLabel,
        sheetName,
        title,
    } = props;

    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    return (
        <TrueSheet
            backgroundColor={colors.card}
            detents={['auto']}
            dismissible={allowDismiss}
            grabberOptions={BOTTOM_SHEET_GRABBER_OPTIONS}
            name={sheetName}
        >
            <View style={styles.trueSheetRoot}>
                {title && (
                    <CustomText style={styles.title} weight="Bold">
                        {title}
                    </CustomText>
                )}

                {description && <CustomText style={styles.subtitle}>{description}</CustomText>}

                {children}

                {primaryActionLabel && (
                    <ActionButton
                        active={primaryButtonEnabled}
                        label={primaryActionLabel}
                        primary={true}
                        style={styles.button}
                        onPress={() => onPrimaryButtonPress?.()}
                    />
                )}

                {secondaryActionLabel ? (
                    <CustomText
                        style={styles.actionText}
                        weight="SemiBold"
                        onPress={() => onSecondaryButtonPress?.()}
                    >
                        {secondaryActionLabel}
                    </CustomText>
                ) : (
                    <View style={styles.spacer} />
                )}
            </View>
        </TrueSheet>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        actionText: {
            color: colors.primary,
            fontSize: 13,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL,
            textAlign: 'center',
        },
        button: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        spacer: {
            height: MARGIN_VERTICAL,
        },
        subtitle: {
            color: colors.primary600,
            fontSize: 15,
            marginTop: MARGIN_VERTICAL / 2,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        title: {
            color: colors.primary300,
            fontSize: 18,
            marginTop: 12,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        trueSheetRoot: {
            paddingTop: MARGIN_VERTICAL,
        },
    });
