import React, { forwardRef, useCallback } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import CustomText from "../components/CustomText";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import { FlashcardUpdate } from "../store/WordsContext";

type FinishSessionBottomSheetProps = {
  flashcardUpdates: FlashcardUpdate[];
  endSession: () => void;
  startNewSession: () => void;
}

const FinishSessionBottomSheet = forwardRef<BottomSheetModal, FinishSessionBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const grade1Count = props.flashcardUpdates.filter(update => update.grade === 1).length;
  const grade2Count = props.flashcardUpdates.filter(update => update.grade === 2).length;
  const grade3Count = props.flashcardUpdates.filter(update => update.grade === 3).length;

  let messageKey = "balancedEffort";

  if (grade3Count > grade1Count && grade3Count > grade2Count) {
    messageKey = "perfect";
  } else if (grade2Count > grade1Count && grade2Count > grade3Count) {
    messageKey = "steadyImprovement";
  } else if (grade1Count > grade2Count && grade1Count > grade3Count) {
    messageKey = "needsImprovement";
  } else if (grade3Count > 0 && grade2Count === 0 && grade1Count === 0) {
    messageKey = "goodProgress";
  }

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      onDismiss={props.endSession}
      enablePanDownToClose={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetScrollView style={styles.root}>
        <CustomText weight={"Bold"} style={styles.title}>{t('sessionSummary')}</CustomText>
        <View style={{ flexDirection: 'row', paddingTop: MARGIN_VERTICAL }}>
          <View style={{ flex: grade3Count, backgroundColor: '#73c576', height: 9 }}/>
          <View style={{ flex: grade2Count, backgroundColor: '#ead66c', height: 9 }}/>
          <View style={{ flex: grade1Count, backgroundColor: '#e48181', height: 9 }}/>

        </View>
        <CustomText style={styles.subtitle}>{t(messageKey, { grade1Count, grade2Count, grade3Count })}</CustomText>

        <ActionButton
          onPress={props.endSession}
          label={'Zakończ sesję'}
          primary={true}
          style={styles.button}
        />
        <CustomText
          style={styles.actionText}
          weight={'SemiBold'}
          onPress={props.startNewSession}
        >
          {t('startNextSession')}
        </CustomText>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
  header: {
    paddingTop: MARGIN_VERTICAL,
  },
  title: {
    color: colors.primary300,
    fontSize: 18,
    marginTop: 12,
  },
  subtitle: {
    color: colors.primary600,
    fontSize: 15,
    marginTop: MARGIN_VERTICAL,
  },
  sessionItemsContainer: {
    flexDirection: 'row',
    flex: 1,
    marginTop: 12,
  },
  progressBar: {
    backgroundColor: colors.background,
    marginTop: 20,
    height: 6,
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: MARGIN_VERTICAL
  },
  box: {
    height: 35,
    paddingHorizontal: 6,
    marginRight: 10,
    backgroundColor: colors.primary,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    marginTop: MARGIN_VERTICAL
  }
});

export default FinishSessionBottomSheet;