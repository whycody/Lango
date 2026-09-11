import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GrabberOptions, TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useHaptics } from '../../hooks';
import { TranslationKey } from '../../types';
import { ActionButton } from '../components/ActionButton';
import { CustomText } from '../components/CustomText';
import { CustomTheme } from '../Theme';

type GenericBottomSheetProps = {
    allowDismiss?: boolean;
    children?: ReactNode;
    description?: string;
    descriptionTx?: TranslationKey;
    onDidDismiss?: () => void;
    onDidPresent?: () => void;
    onWillPresent?: () => void;
    onPrimaryButtonPress?: () => void;
    onSecondaryButtonPress?: () => void;
    primaryActionIcon?: keyof typeof Ionicons.glyphMap;
    primaryActionLabel?: string;
    primaryActionLabelTx?: TranslationKey;
    primaryButtonLoading?: boolean;
    secondaryActionLabel?: string;
    secondaryActionLabelTx?: TranslationKey;
    primaryButtonEnabled?: boolean;
    secondaryButtonEnabled?: boolean;
    sheetName: string;
    title?: string;
    titleTx?: TranslationKey;
    style?: StyleProp<ViewStyle>;
};

const BOTTOM_SHEET_GRABBER_OPTIONS: GrabberOptions = {
    color: 'white',
};

export const GenericBottomSheet = (props: GenericBottomSheetProps) => {
    const {
        allowDismiss = true,
        children,
        description,
        descriptionTx,
        onDidDismiss,
        onDidPresent,
        onPrimaryButtonPress,
        onSecondaryButtonPress,
        onWillPresent,
        primaryActionIcon,
        primaryActionLabel,
        primaryActionLabelTx,
        primaryButtonEnabled,
        primaryButtonLoading = false,
        secondaryActionLabel,
        secondaryActionLabelTx,
        secondaryButtonEnabled = true,
        sheetName,
        style,
        title,
        titleTx,
    } = props;

    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const { triggerHaptics } = useHaptics();
    const styles = getStyles(colors);

    const resolvedTitle = titleTx ? t(titleTx) : title;
    const resolvedDescription = descriptionTx ? t(descriptionTx) : description;
    const resolvedPrimaryActionLabel = primaryActionLabelTx
        ? t(primaryActionLabelTx)
        : primaryActionLabel;
    const resolvedSecondaryActionLabel = secondaryActionLabelTx
        ? t(secondaryActionLabelTx)
        : secondaryActionLabel;

    const handlePrimaryButtonPress = () => {
        onPrimaryButtonPress?.();
    };

    const handleSecondaryButtonPress = () => {
        if (!secondaryButtonEnabled) return;
        triggerHaptics();
        onSecondaryButtonPress?.();
    };

    return (
        <TrueSheet
            backgroundColor={colors.card}
            detents={['auto']}
            dismissible={allowDismiss}
            grabberOptions={BOTTOM_SHEET_GRABBER_OPTIONS}
            name={sheetName}
            onDidDismiss={onDidDismiss}
            onDidPresent={onDidPresent}
            onWillPresent={onWillPresent}
        >
            <View style={styles.trueSheetRoot}>
                {resolvedTitle && (
                    <CustomText style={styles.title} text={resolvedTitle} weight="Bold" />
                )}

                {resolvedDescription && (
                    <CustomText
                        style={[styles.subtitle, !!children && styles.subtitleSmall]}
                        text={resolvedDescription}
                    />
                )}

                <View style={style}>{children}</View>

                {resolvedPrimaryActionLabel && (
                    <ActionButton
                        active={primaryButtonEnabled}
                        icon={primaryActionIcon}
                        label={resolvedPrimaryActionLabel}
                        loading={primaryButtonLoading}
                        primary={true}
                        style={styles.button}
                        onPress={handlePrimaryButtonPress}
                    />
                )}

                {resolvedSecondaryActionLabel ? (
                    <CustomText
                        text={resolvedSecondaryActionLabel}
                        weight="SemiBold"
                        style={[
                            styles.actionText,
                            !secondaryButtonEnabled && styles.actionTextDisabled,
                        ]}
                        onPress={handleSecondaryButtonPress}
                    />
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
            color: colors.white,
            fontSize: 13,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL,
            textAlign: 'center',
        },
        actionTextDisabled: {
            opacity: 0.4,
        },
        button: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        spacer: {
            height: MARGIN_VERTICAL,
        },
        subtitle: {
            color: colors.white300,
            fontSize: 15,
            marginTop: 6,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        subtitleSmall: {
            marginTop: 2,
        },
        title: {
            color: colors.white,
            fontSize: 18,
            marginTop: 12,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        trueSheetRoot: {
            paddingTop: MARGIN_VERTICAL,
        },
    });
