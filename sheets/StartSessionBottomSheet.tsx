import React, { forwardRef, useCallback, useState } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import SessionLengthItem from "../components/items/SessionLengthItem";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Header from "../components/Header";

interface StartSessionBottomSheetProps {
  onSessionStart: (length: 1 | 2 | 3) => void,
}

const StartSessionBottomSheet = forwardRef<BottomSheetModal, StartSessionBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [sessionLength, setSessionLength] = useState<1 | 2 | 3>(2)
  const { t } = useTranslation();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const handleSessionLengthItemPress = (length: 1 | 2 | 3) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setSessionLength(length);
  }

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
    >
      <BottomSheetScrollView style={styles.root}>
        <Header title={t('startSession')} subtitle={t('sessionLength')} style={styles.header}/>
        <View style={styles.sessionItemsContainer}>
          <SessionLengthItem
            length={1}
            selected={sessionLength === 1}
            style={{ flex: 1, marginRight: 6 }}
            onPress={() => handleSessionLengthItemPress(1)}
          />
          <SessionLengthItem
            length={2}
            selected={sessionLength === 2}
            style={{ flex: 1, marginLeft: 3, marginRight: 3 }}
            onPress={() => handleSessionLengthItemPress(2)}
          />
          <SessionLengthItem
            length={3}
            selected={sessionLength === 3}
            style={{ flex: 1, marginLeft: 6, }}
            onPress={() => handleSessionLengthItemPress(3)}
          />
        </View>
        <ActionButton
          onPress={() => props.onSessionStart(sessionLength)}
          label={t('startSession')}
          primary={true}
          style={styles.button}
          icon={'play-sharp'}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
  header: {
    paddingVertical: MARGIN_VERTICAL / 2,
  },
  sessionItemsContainer: {
    flexDirection: 'row',
    flex: 1,
    marginTop: 5,
  },
  button: {
    marginVertical: MARGIN_VERTICAL
  }
});

export default StartSessionBottomSheet;