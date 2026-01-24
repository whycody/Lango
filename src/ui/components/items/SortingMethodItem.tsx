import { FC, memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../../../constants/margins";
import CustomText from "../CustomText";
import { useTheme } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type SortingMethodItemProps = {
  index: number;
  id: number;
  label: string
  checked: boolean,
  onPress: (id: number) => void;
  style?: any;
}

const SortingMethodItem: FC<SortingMethodItemProps> =
  ({ index, id, label, checked, onPress, style }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
      <Pressable
        key={label}
        style={style}
        onPress={() => onPress(id)}
        android_ripple={{ color: colors.background }}
      >
        {index !== 0 && <View style={{ width: '100%', height: 3, backgroundColor: colors.background }}/>}
        <LinearGradient
          colors={['transparent', checked ? colors.cardAccent600 : 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.container}>
            <MaterialCommunityIcons name={'sort'} color={colors.primary600} size={22}/>
            <View style={styles.textContainer}>
              <CustomText weight={'SemiBold'} style={styles.text}>{label}</CustomText>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

const getStyles = (colors: any) => StyleSheet.create({
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
})

export default memo(SortingMethodItem);