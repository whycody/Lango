import React, { FC } from "react";
import { useTheme } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomText from "../CustomText";
import { StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import { useTranslation } from "react-i18next";

type SessionHeaderProps = {
  length: 1 | 2 | 3;
  progress: number;
  onSessionExit: () => void;
  onFlipCards: () => void;
}

const SessionHeader: FC<SessionHeaderProps> = ({ length, progress, onSessionExit, onFlipCards }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const cardsSetLength = length * 10;

  return (
    <View style={styles.headerContainer}>
      <MaterialCommunityIcons
        name={'exit-to-app'}
        size={21}
        color={colors.primary300}
        style={[{ transform: [{ rotate: '180deg' }] }, styles.icon]}
        onPress={onSessionExit}
      />
      <CustomText weight={"SemiBold"} style={styles.progressText}>
        {`${progress}`}
      </CustomText>
      <CustomText weight="SemiBold" style={styles.title}>
        {cardsSetLength === 10
          ? t('shortSession')
          : cardsSetLength === 20
            ? t('mediumSession')
            : t('longSession')}
      </CustomText>
      <CustomText weight={"SemiBold"} style={styles.progressText}>
        {`${cardsSetLength - progress}`}
      </CustomText>
      <MaterialCommunityIcons
        name={'arrange-send-backward'}
        size={21}
        color={colors.primary300}
        onPress={onFlipCards}
        style={styles.icon}
      />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  title: {
    fontSize: 15,
    paddingHorizontal: 10,
    color: colors.primary300,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingTop: MARGIN_VERTICAL,
    justifyContent: 'space-between'
  },
  progressText: {
    color: colors.primary600,
    width: 30,
    textAlign: 'center'
  },
  icon: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    height: '100%'
  }
});

export default SessionHeader;