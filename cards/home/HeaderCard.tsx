import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { expo } from '../../app.json'
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import CustomText from "../../components/CustomText";
import { ProgressBar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import ActionButton from "../../components/ActionButton";
import StartSessionBottomSheet from "../../sheets/StartSessionBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

const HeaderCard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handleActinButtonPress = () => {
    console.log(bottomSheetRef);
    bottomSheetRef.current.present();
  }

  const handleSessionStart = (length: 1|2|3) => {
    bottomSheetRef.current.close();
  }

  return (
    <View style={styles.root}>
      <StartSessionBottomSheet ref={bottomSheetRef} onSessionStart={handleSessionStart}/>
      <CustomText weight={"Bold"} style={styles.mainText}>{expo.name}</CustomText>
      <ProgressBar progress={0.62} color={colors.primary300} style={styles.progressBar}/>
      <CustomText style={styles.descText}>
        {t('wordsPercentage', { percentage: 62 }) + ' ' + t('practiceNow')}
      </CustomText>
      <ActionButton
        label={t('startLearning')}
        primary={true}
        icon={'play'}
        style={styles.actionButton}
        onPress={handleActinButtonPress}
      />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: MARGIN_VERTICAL,
  },
  mainText: {
    color: colors.primary,
    fontSize: 26,
  },
  progressBar: {
    backgroundColor: colors.card,
    marginTop: 12,
    height: 7
  },
  descText: {
    fontSize: 15,
    color: colors.primary600,
    marginTop: 16,
  },
  actionButton: {
    marginTop: 32,
  }
});

export default HeaderCard;