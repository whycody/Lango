import { FC, memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../../src/constants";
import CustomText from "../CustomText";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

type FlashcardListItemProps = {
  id: string;
  index: number;
  text: string;
  translation: string;
  style?: any;
  onEditPress?: (id: string) => void;
  onRemovePress?: (id: string) => void;
}

const FlashcardListItem: FC<FlashcardListItemProps> =
  ({ id, index, text, translation, style, onEditPress, onRemovePress }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
      <Pressable
        key={id}
        style={[styles.root, style]}
        android_ripple={{ color: colors.background }}
      >
        {index !== 0 && <View style={{ width: '100%', height: 4, backgroundColor: colors.card }}/>}
        <View style={styles.container}>
          <Ionicons name={'reader-sharp'} color={colors.primary600} size={22}/>
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
              color={colors.primary600}
              size={22}
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
    backgroundColor: colors.background
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
  }
})

export default memo(FlashcardListItem);