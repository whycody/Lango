import React, { forwardRef, useCallback, useMemo } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { MARGIN_HORIZONTAL } from "../../constants/margins";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import { FlashList } from "@shopify/flash-list";
import { FlashcardSortingMethod, useUserPreferences } from "../../store/UserPreferencesContext";
import { getSortingMethodLabel } from "../../utils/sortingUtil";
import SortingMethodItem from "../components/items/SortingMethodItem";

type SortingMethodBottomSheetProps = {
  onChangeIndex?: (index: number) => void;
}

const SortingMethodBottomSheet = forwardRef<BottomSheetModal, SortingMethodBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const { flashcardsSortingMethod, setFlashcardsSortingMethod } = useUserPreferences();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const sortingMethods = useMemo(() =>
    Object.values(FlashcardSortingMethod).filter(v => typeof v === "number") as FlashcardSortingMethod[], []);

  const handlePress = useCallback((method: FlashcardSortingMethod) => {
    setFlashcardsSortingMethod(method);
    ref.current?.dismiss();
  }, [])

  const renderItem = useCallback(({ item, index }: { item: FlashcardSortingMethod; index: number }) => (
    <SortingMethodItem
      id={item}
      onPress={handlePress}
      label={getSortingMethodLabel(item)}
      checked={flashcardsSortingMethod === item}
      index={index}
    />
  ), [handlePress, flashcardsSortingMethod]);

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      onChange={(index: number) => props.onChangeIndex?.(index)}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetModal}
      handleIndicatorStyle={styles.handleIndicatorStyle}
    >
      <BottomSheetScrollView>
        <Header
          title={t('sorting.title')}
          subtitle={t('sorting.desc')}
          style={styles.header}
        />
        <FlashList
          data={sortingMethods}
          estimatedItemSize={55}
          extraData={flashcardsSortingMethod}
          renderItem={renderItem}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  header: {
    marginVertical: 10,
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
  bottomSheetModal: {
    backgroundColor: colors.card
  },
  handleIndicatorStyle: {
    backgroundColor: colors.primary,
    borderRadius: 0
  }
});

export default SortingMethodBottomSheet;