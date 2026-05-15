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
    primaryButtonLoading?: boolean;
    secondaryActionLabel?: string;
    primaryButtonEnabled?: boolean;
    secondaryButtonEnabled?: boolean;
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
        primaryButtonLoading = false,
        secondaryActionLabel,
        secondaryButtonEnabled = true,
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
                        loading={primaryButtonLoading}
                        primary={true}
                        style={styles.button}
                        onPress={() => onPrimaryButtonPress?.()}
                    />
                )}

                {secondaryActionLabel ? (
                    <CustomText
                        weight="SemiBold"
                        style={[
                            styles.actionText,
                            !secondaryButtonEnabled && styles.actionTextDisabled,
                        ]}
                        onPress={secondaryButtonEnabled ? onSecondaryButtonPress : undefined}
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
