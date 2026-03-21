import React, { FC, memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "./CustomText";
import { Ionicons } from "@expo/vector-icons";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { SessionWord } from "../../types";

interface CardProps {
  text: string;
  frontSide?: boolean;
  word?: SessionWord;
  wordIndex?: number;
  onPlayAudio?: (word: SessionWord, frontSide: boolean) => void;
  onBackPress?: () => void;
  onEditPress?: (id: string) => void;
  onContinuePress?: (id: string) => void;
  userHasEverSkippedSuggestion?: boolean;
}

export const Card: FC<CardProps> = (props) => {
  const {
    word,
    frontSide = true,
    wordIndex,
    text,
    onPlayAudio,
    onBackPress,
    onEditPress,
    onContinuePress,
    userHasEverSkippedSuggestion,
  } = props;

  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(colors);

  const isSuggestion = word?.type === "suggestion";
  const actionButtonIsActive =
    (!isSuggestion && onEditPress) || (isSuggestion && onContinuePress);

  const handleActionButtonPress = useCallback(() => {
    if (!isSuggestion && onEditPress) {
      onEditPress(word.id);
    }

    if (isSuggestion && onContinuePress) {
      onContinuePress(word.id);
    }
  }, [isSuggestion, word]);

  return (
    <LinearGradient
      colors={[colors.cardAccent, colors.cardAccent600]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      {isSuggestion && (
        <CustomText weight={"Bold"} style={styles.newWordSuggestion}>
          {t("new_word_suggestion")}
        </CustomText>
      )}
      <View style={styles.textContainer}>
        <CustomText
          weight={"SemiBold"}
          style={[
            styles.text,
            text.length > 300 && styles.longText,
            !word && styles.exampleFlashcardText,
          ]}
          adjustsFontSizeToFit
        >
          {text}
        </CustomText>
        {onPlayAudio && word && (
          <Pressable
            style={styles.playButton}
            onPress={() => onPlayAudio(word, frontSide)}
          >
            <CustomText weight={"SemiBold"} style={styles.playText}>
              {t("play")}
            </CustomText>
            <Ionicons
              name={"volume-high-sharp"}
              color={colors.primary300}
              size={14}
            />
          </Pressable>
        )}
        <View style={styles.tagsContainer}>
          {word?.tags?.map((tag) => (
            <CustomText weight={"SemiBold"} style={styles.tag} key={tag}>
              {t(`word_tags.${tag}`)}
            </CustomText>
          ))}
        </View>
      </View>
      <View style={styles.cardIconsContainer}>
        <Ionicons
          size={24}
          name={"arrow-back-sharp"}
          color={colors.primary300}
          style={[
            styles.icon,
            { opacity: wordIndex != 0 && onBackPress ? 1 : 0.4 },
          ]}
          onPress={() => wordIndex != 0 && onBackPress && onBackPress()}
        />
        {!userHasEverSkippedSuggestion && isSuggestion && (
          <CustomText weight={"SemiBold"} style={styles.skipSuggestionText}>
            {t("press_arrow_to_skip_suggestion")}
          </CustomText>
        )}
        <Ionicons
          size={24}
          name={isSuggestion ? "arrow-forward-sharp" : "pencil-sharp"}
          style={[
            styles.icon,
            { opacity: actionButtonIsActive ? 1 : 0.4 },
            isSuggestion && !userHasEverSkippedSuggestion && styles.iconMarked,
          ]}
          color={colors.primary300}
          onPress={handleActionButtonPress}
        />
      </View>
    </LinearGradient>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.cardAccent300,
    },
    textContainer: {
      flex: 1,
      justifyContent: "center",
    },
    playButton: {
      backgroundColor: colors.cardAccent600,
      paddingHorizontal: 12,
      alignItems: "center",
      alignSelf: "center",
      flexDirection: "row",
      marginVertical: 10,
      padding: 4,
      opacity: 0.8,
      gap: 6,
    },
    playText: {
      color: colors.primary300,
      fontSize: 11,
    },
    tagsContainer: {
      flexDirection: "row",
      opacity: 0.6,
      gap: 4,
      justifyContent: "center",
      width: "75%",
      alignSelf: "center",
      flexWrap: "wrap",
    },
    tag: {
      backgroundColor: colors.cardAccent,
      color: colors.primary600,
      paddingHorizontal: 5,
      paddingVertical: 1,
      fontSize: 9,
    },
    text: {
      color: colors.primary,
      marginHorizontal: MARGIN_HORIZONTAL * 2,
      marginTop: MARGIN_VERTICAL * 4,
      fontSize: 25,
      textAlign: "center",
      textAlignVertical: "center",
    },
    longText: {
      textAlign: "left",
      marginTop: MARGIN_VERTICAL * 3,
    },
    exampleFlashcardText: {
      marginTop: MARGIN_VERTICAL * 2,
    },
    newWordSuggestion: {
      color: colors.cardAccent300,
      backgroundColor: colors.primary,
      fontSize: 12.5,
      textAlign: "center",
      position: "absolute",
      top: 20,
      left: -1.5,
      right: -1.5,
    },
    cardIconsContainer: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    skipSuggestionText: {
      color: colors.cardAccent,
      textAlign: "center",
      fontSize: 10,
      marginBottom: 4,
      flex: 1,
    },
    icon: {
      margin: MARGIN_HORIZONTAL / 2,
      padding: MARGIN_HORIZONTAL / 2,
    },
    iconMarked: {
      backgroundColor: colors.cardAccent,
      borderRadius: 50,
    },
  });
