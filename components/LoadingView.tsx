import React, { FC, memo } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import CustomText from "./CustomText";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

type LoadingViewProps = {}

const LoadingView: FC<LoadingViewProps> = ({}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(colors);

  return (
    <>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 90 }}>
        <ActivityIndicator size="large" color={colors.primary}/>
        <CustomText
          weight={'Bold'}
          style={styles.headerText}
        >
          {t('loading_content')}
        </CustomText>
        <CustomText style={styles.descText}>
          {t('loading_content_desc')}
        </CustomText>
      </View>
      <Image
        source={require('../assets/lango-logo.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  headerText: {
    color: colors.primary300,
    fontSize: 17,
    marginTop: 30
  },
  descText: {
    color: colors.primary600,
    fontSize: 14,
    marginTop: 5
  },
  image: {
    height: 40,
    alignSelf: 'center',
    marginBottom: 50,
  }
});

export default memo(LoadingView);