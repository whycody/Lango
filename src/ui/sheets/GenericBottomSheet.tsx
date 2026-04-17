import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GrabberOptions, TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { ActionButton } from '../components/ActionButton';
import { CustomText } from '../components/CustomText';
import { CustomTheme } from '../Theme';

type GenericBottomSheetProps = {
    allowDismiss?: boolean;
    children?: ReactNode;
    description?: string;
    onDidDismiss?: () => void;
    onDidPresent?: () => void;
    onPrimaryButtonPress?: () => void;
    onSecondaryButtonPress?: () => void;
    primaryActionIcon?: keyof typeof Ionicons.glyphMap;
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
    primaryButtonEnabled?: boolean;
    sheetName: string;
    title?: string;
    style?: StyleProp<ViewStyle>;
};

const BOTTOM_SHEET_GRABBER_OPTIONS: GrabberOptions = {
    color: 'white',
    cornerRadius: 0,
};

export const GenericBottomSheet = (props: GenericBottomSheetProps) => {
    const {
        allowDismiss = true,
        children,
        description,
        onDidDismiss,
        onDidPresent,
        onPrimaryButtonPress,
        onSecondaryButtonPress,
        primaryActionIcon,
        primaryActionLabel,
        primaryButtonEnabled,
        secondaryActionLabel,
        sheetName,
        style,
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
            onDidDismiss={onDidDismiss}
            onDidPresent={onDidPresent}
        >
            <View style={styles.trueSheetRoot}>
                {title && (
                    <CustomText style={styles.title} weight="Bold">
                        {title}
                    </CustomText>
                )}

                {description && (
                    <CustomText style={[styles.subtitle, !!children && styles.subtitleSmall]}>
                        {description}
                    </CustomText>
                )}

                <View style={style}>{children}</View>

                {primaryActionLabel && (
                    <ActionButton
                        active={primaryButtonEnabled}
                        icon={primaryActionIcon}
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
        subtitleSmall: {
            marginTop: MARGIN_VERTICAL / 4,
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
