import React, { FC } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { CustomText } from ".";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";

type LoadingViewProps = {};

export const LoadingView: FC<LoadingViewProps> = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primary} />
        <CustomText weight={"Bold"} style={styles.headerText}>
          {t("loading_content")}
        </CustomText>
        <CustomText style={styles.descText}>
          {t("loading_content_desc")}
        </CustomText>
      </View>
      <Image
        source={require("../../../assets/lango-logo.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const getStyles = (colors: any, insets: EdgeInsets) =>
  StyleSheet.create({
    root: {
      paddingTop: insets.top,
      paddingBottom: insets.bottom + 50,
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 90,
    },
    headerText: {
      color: colors.primary300,
      fontSize: 17,
      paddingTop: 30,
    },
    descText: {
      color: colors.primary600,
      fontSize: 14,
      paddingTop: 5,
    },
    image: {
      height: 40,
      alignSelf: "center",
      paddingBottom: 50,
    },
  });
