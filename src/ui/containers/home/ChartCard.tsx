import React, { FC, ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { Header } from '../../components';

type ChartCardProps = {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    subtitle?: string;
    title: string;
};

export const ChartCard: FC<ChartCardProps> = ({ children, style, subtitle, title }) => {
    return (
        <View style={[styles.root, style]}>
            <Header subtitle={subtitle} title={title} />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        marginTop: MARGIN_VERTICAL / 2,
        overflow: 'hidden',
        padding: MARGIN_HORIZONTAL,
    },
});
