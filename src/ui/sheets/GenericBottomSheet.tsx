import React, { forwardRef, ReactNode, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import CustomText from "../components/CustomText";
import ActionButton from "../components/ActionButton";

type GenericBottomSheetProps = {
  title?: string;
  description?: string;
  stackBehavior?: "replace" | "push" | "switch";
  primaryActionLabel?: string;
  onPrimaryButtonPress?: () => void;
  secondaryActionLabel?: string;
  onSecondaryButtonPress?: () => void;
  onChangeIndex?: (index: number) => void;
  children?: ReactNode;
};

export const GenericBottomSheet = forwardRef<BottomSheetModal, GenericBottomSheetProps>(
  (
    {
      title,
      description,
      stackBehavior = 'push',
      primaryActionLabel,
      onPrimaryButtonPress,
      secondaryActionLabel,
      onSecondaryButtonPress,
      onChangeIndex,
      children
    },
    ref
  ) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        stackBehavior={stackBehavior}
        onChange={(index: number) => onChangeIndex?.(index)}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
      >
        <BottomSheetScrollView>
          {title && (
            <CustomText weight="Bold" style={styles.title}>
              {title}
            </CustomText>
          )}

          {description && (
            <CustomText style={styles.subtitle}>
              {description}
            </CustomText>
          )}

          {children}

          {primaryActionLabel && (
            <ActionButton
              onPress={() => onPrimaryButtonPress?.()}
              label={primaryActionLabel}
              primary={true}
              style={styles.button}
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

          <View style={styles.spacer}/>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const getStyles = (colors: any) => StyleSheet.create({
  title: {
    color: colors.primary300,
    fontSize: 18,
    marginTop: 12,
    paddingHorizontal: MARGIN_HORIZONTAL
  },
  subtitle: {
    color: colors.primary600,
    fontSize: 15,
    marginTop: MARGIN_VERTICAL / 2,
    paddingHorizontal: MARGIN_HORIZONTAL
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: "center",
    paddingTop: MARGIN_VERTICAL,
    paddingHorizontal: MARGIN_HORIZONTAL
  },
  button: {
    marginTop: MARGIN_VERTICAL,
    marginHorizontal: MARGIN_HORIZONTAL
  },
  spacer: {
    height: MARGIN_VERTICAL
  }
});