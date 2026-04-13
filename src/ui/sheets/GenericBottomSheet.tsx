import React, { ForwardedRef, forwardRef, ReactNode, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { ActionButton, CustomText } from '../components';
import { CustomTheme } from '../Theme';

type GenericBottomSheetProps = {
    allowDismiss?: boolean;
    children?: ReactNode;
    description?: string;
    onChangeIndex?: (index: number) => void;
    onPrimaryButtonPress?: () => void;
    onSecondaryButtonPress?: () => void;
    primaryActionLabel?: string;
    primaryButtonEnabled?: boolean;
    secondaryActionLabel?: string;
    stackBehavior?: 'replace' | 'push' | 'switch';
    title?: string;
};

export const GenericBottomSheet = forwardRef<BottomSheetModal, GenericBottomSheetProps>(
    (
        {
            allowDismiss = true,
            children,
            description,
            onChangeIndex,
            onPrimaryButtonPress,
            onSecondaryButtonPress,
            primaryActionLabel,
            primaryButtonEnabled,
            secondaryActionLabel,
            stackBehavior = 'push',
            title,
        },
        ref: ForwardedRef<BottomSheetModal>,
    ) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    pressBehavior={allowDismiss ? 'close' : 'none'}
                    {...props}
                />
            ),
            [],
        );

        return (
            <BottomSheetModal
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetModal}
                enablePanDownToClose={allowDismiss}
                handleIndicatorStyle={styles.handleIndicatorStyle}
                index={0}
                ref={ref}
                stackBehavior={stackBehavior}
                onChange={(index: number) => onChangeIndex?.(index)}
            >
                <BottomSheetScrollView>
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

                    {secondaryActionLabel && (
                        <CustomText
                            style={styles.actionText}
                            weight="SemiBold"
                            onPress={() => onSecondaryButtonPress?.()}
                        >
                            {secondaryActionLabel}
                        </CustomText>
                    )}

                    <View style={styles.spacer} />
                </BottomSheetScrollView>
            </BottomSheetModal>
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        actionText: {
            color: colors.primary,
            fontSize: 13,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL,
            textAlign: 'center',
        },
        bottomSheetModal: {
            backgroundColor: colors.card,
        },
        button: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        handleIndicatorStyle: {
            backgroundColor: colors.primary,
            borderRadius: 0,
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
    });
