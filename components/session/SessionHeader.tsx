import React, { FC } from "react";
import { useTheme } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomText from "../CustomText";
import { StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../../src/constants";
import { useTranslation } from "react-i18next";

type SessionHeaderProps = {
  length: 1 | 2 | 3;
  cardsSetLength: number;
  progress: number;
  onSessionExit: () => void;
  onFlipCards: () => void;
}

const SessionHeader: FC<SessionHeaderProps> = ({ length, cardsSetLength, progress, onSessionExit, onFlipCards }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

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
        {length === 1
          ? t('shortSession')
          : length === 2
            ? t('mediumSession')
            : t('longSession')}
      </CustomText>
      <CustomText weight={"SemiBold"} style={styles.progressText}>
        {`${cardsSetLength - progress}`}
      </CustomText>
      <MaterialCommunityIcons
        name={'flip-horizontal'}
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
    color: colors.primary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  headerContainer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressText: {
    color: colors.primary600,
    width: 30,
    textAlign: 'center'
  },
  icon: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: 5,
    height: '100%',
  }
});

export default SessionHeader;