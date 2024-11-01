import { StyleSheet, View } from "react-native";
import { MARGIN_VERTICAL } from "../../src/constants";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../../components/CustomText";

const ProfileCard = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.root}>
      <View style={styles.profileIconContainer}>
        <Ionicons name={'person-sharp'} size={80} color={colors.primary300} style={{ marginTop: 25 }}/>
      </View>
      <CustomText weight={'SemiBold'} style={styles.name}>Oktawian Kausz</CustomText>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: MARGIN_VERTICAL * 3,
  },
  profileIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.cardAccent,
    alignItems: 'center',
  },
  name: {
    color: colors.primary300,
    fontSize: 22,
    marginTop: 18,
  },
});

export default ProfileCard;