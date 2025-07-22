import { StyleSheet, View, Image } from "react-native";
import { MARGIN_VERTICAL } from "../../src/constants";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../../components/CustomText";
import { useAuth } from "../../api/auth/AuthProvider";

const ProfileCard = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const auth = useAuth();

  if (!auth.user) return null;

  return (
    <View style={styles.root}>
      {auth.user.picture ? (
        <View style={styles.profileIconContainer}>
          <Image source={{ uri: auth.user.picture }} style={{ width: 90, height: 90, marginTop: 5, }} resizeMode="cover"/>
        </View>
      ) : (
        <View style={styles.profileIconContainer}>
          <Ionicons name={'person-sharp'} size={80} color={colors.primary300} style={{ marginTop: 24 }} />
        </View>
      )}
      <CustomText weight={'Bold'} style={styles.name}>{auth.user.name}</CustomText>
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
    color: colors.primary,
    fontSize: 22,
    marginTop: 18,
  },
});

export default ProfileCard;