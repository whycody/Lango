import React, { FC } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import ENFlag from '../../../assets/flags/eng.svg';
import ESFlag from '../../../assets/flags/es.svg';
import ITFlag from '../../../assets/flags/it.svg';
import PLFlag from '../../../assets/flags/pl.svg';
import { spacing } from '../../constants/margins';

const flagMap: Record<string, any> = {
    en: ENFlag,
    es: ESFlag,
    it: ITFlag,
    pl: PLFlag,
};

type SquareFlagProps = {
    languageCode: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
};

export const SquareFlag: FC<SquareFlagProps> = ({ languageCode, size = 20, style }) => {
    const Flag = flagMap[languageCode];

    if (!Flag) {
        return null;
    }

    return (
        <View
            style={[
                {
                    borderRadius: spacing.xxs,
                    height: size,
                    overflow: 'hidden',
                    width: size,
                },
                style,
            ]}
        >
            <Flag height={size} width={size} />
        </View>
    );
};
