import { FC } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import appBuildNumbers from '../../../app.json';
import { CustomText } from '.';

type VersionFooterProps = {
    small?: boolean;
    style?: StyleProp<ViewStyle>;
};

export const VersionFooter: FC<VersionFooterProps> = ({ small = false, style }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const version = appBuildNumbers.expo.version;

    return (
        <View>
            {!small && (
                <Image
                    resizeMode="contain"
                    source={require('../../../assets/logo.png')}
                    style={styles.image}
                />
            )}
            <CustomText style={[style, styles.version, small && styles.smallVersion]}>
                {`${version}`}
            </CustomText>
        </View>
    );
};

const getStyles = (colors: any) =>
    StyleSheet.create({
        image: {
            alignSelf: 'center',
            height: 40,
            marginTop: 30,
        },
        smallVersion: {
            color: colors.primary600,
            fontSize: 12,
        },
        version: {
            color: colors.primary300,
            fontSize: 13,
            fontWeight: 'bold',
            textAlign: 'center',
        },
    });
