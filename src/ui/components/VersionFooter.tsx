import { FC, useMemo } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import appBuildNumbers from '../../../app.json';
import { CustomTheme } from '../Theme';
import { CustomText } from './CustomText';

type VersionFooterProps = {
    small?: boolean;
    style?: StyleProp<ViewStyle>;
};

export const VersionFooter: FC<VersionFooterProps> = ({ small = false, style }) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);
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

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        image: {
            alignSelf: 'center',
            height: 40,
            marginTop: 30,
        },
        smallVersion: {
            color: colors.white300,
            fontSize: 12,
        },
        version: {
            color: colors.white,
            fontSize: 13,
            fontWeight: 'bold',
            textAlign: 'center',
        },
    });
