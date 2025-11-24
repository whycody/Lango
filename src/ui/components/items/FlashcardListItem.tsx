import { FC, memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../../../constants/margins";
import CustomText from "../CustomText";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getLevelColor } from "../../../utils/getLevelColor";

type FlashcardListItemProps = {
  id: string;
  text: string;
  level: number;
  translation: string;
  style?: any;
  onPress?: (id: string) => void;
  onEditPress?: (id: string) => void;
  onRemovePress?: (id: string) => void;
}

const FlashcardListItem: FC<FlashcardListItemProps> =
  ({ id, text, level, translation, style, onPress, onEditPress, onRemovePress }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const getColor = useCallback((level: number) => {
      return getLevelColor(level);
    }, []);

    return (
      <Pressable style={[styles.root, style]} android_ripple={{ color: colors.card }} onPress={() => onPress?.(id)}>
        <View style={styles.container}>
          <Ionicons name={'reader-sharp'} color={getColor(level)} size={22}/>
          <View style={styles.textContainer}>
            <CustomText weight={'SemiBold'} style={styles.text}>{text}</CustomText>
            <CustomText style={styles.translation}>{translation}</CustomText>
          </View>
          {onRemovePress &&
            <Ionicons
              name={'trash-sharp'}
              color={colors.primary600}
              size={22}
              style={styles.icon}
              onPress={() => onRemovePress(id)}
            />
          }
          {onEditPress &&
            <Ionicons
              name={'pencil-sharp'}
              color={colors.primary300}
              size={21}
              style={styles.icon}
              onPress={() => onEditPress(id)}
            />
          }
        </View>
      </Pressable>
    );
  }

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    borderTopWidth: 3,
    backgroundColor: colors.background,
    borderColor: colors.card
  },
  container: {
    paddingVertical: 15,
    paddingHorizontal: MARGIN_HORIZONTAL,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textContainer: {
    flex: 1,
    marginLeft: 10
  },
  text: {
    color: colors.primary,
    fontSize: 14
  },
  translation: {
    color: colors.primary300,
    fontSize: 13
  },
  icon: {
    marginLeft: 10,
    padding: 5,
    paddingRight: 0,
    opacity: 0.8,
  }
})

export default memo(FlashcardListItem);