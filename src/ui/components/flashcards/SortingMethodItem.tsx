import { memo } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

type SortingMethodItemProps = {
    checked: boolean;
    id: number;
    index: number;
    label: string;
    onPress: (id: number) => void;
    style?: StyleProp<ViewStyle>;
};

export const SortingMethodItem = memo<SortingMethodItemProps>(
    ({ checked, id, index, label, onPress, style }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);

        return (
            <Pressable
                key={label}
                android_ripple={{ color: colors.background }}
                style={style}
                onPress={() => onPress(id)}
            >
                {index !== 0 && <View style={styles.divider} />}
                <LinearGradient
                    colors={['transparent', checked ? colors.cardAccent600 : 'transparent']}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                >
                    <View style={styles.container}>
                        <MaterialCommunityIcons color={colors.primary600} name={'sort'} size={22} />
                        <View style={styles.textContainer}>
                            <CustomText style={styles.text} weight={'SemiBold'}>
                                {label}
                            </CustomText>
                        </View>
                    </View>
                </LinearGradient>
            </Pressable>
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 15,
        },
        divider: {
            backgroundColor: colors.background,
            height: 3,
            width: '100%',
        },
        text: {
            color: colors.primary,
            fontSize: 14,
        },
        textContainer: {
            flex: 1,
            marginLeft: 10,
        },
    });
