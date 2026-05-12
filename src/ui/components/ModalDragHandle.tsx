import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { isIOS } from '../../utils/deviceUtils';
import { CustomTheme } from '../Theme';

export const ModalDragHandle = () => {
    const { colors } = useTheme() as CustomTheme;

    if (!isIOS) return null;

    return <View style={[styles.handle, { backgroundColor: colors.white }]} />;
};

const styles = StyleSheet.create({
    handle: {
        alignSelf: 'center',
        height: 5,
        marginVertical: 12,
        width: 36,
    },
});
