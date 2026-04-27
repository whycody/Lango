import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_VERTICAL } from '../../../constants/margins';
import { useAuth } from '../../../store/AuthContext';
import { CustomText } from '../../components';
import { CustomTheme } from '../../Theme';

export const ProfileCard = () => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
    const { user } = useAuth();

    if (!user) return null;

    return (
        <View style={styles.root}>
            {user.picture ? (
                <View style={styles.profileIconContainer}>
                    <Image
                        resizeMode="cover"
                        source={{ uri: user.picture }}
                        style={styles.profileImage}
                    />
                </View>
            ) : (
                <View style={styles.profileIconContainer}>
                    <Ionicons
                        color={colors.primary300}
                        name={'person-sharp'}
                        size={80}
                        style={styles.profileFallbackIcon}
                    />
                </View>
            )}
            {user.name && (
                <CustomText style={styles.name} weight={'Bold'}>
                    {user.name}
                </CustomText>
            )}
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        name: {
            color: colors.primary,
            fontSize: 22,
            marginTop: 18,
        },
        profileFallbackIcon: {
            marginTop: 24,
        },
        profileIconContainer: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent,
            height: 100,
            width: 100,
        },
        profileImage: {
            height: 90,
            marginTop: 5,
            width: 90,
        },
        root: {
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: MARGIN_VERTICAL * 3,
        },
    });
