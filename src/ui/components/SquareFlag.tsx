import React, { FC } from 'react';

import ENFlag from '../../../assets/flags/eng.svg';
import ESFlag from '../../../assets/flags/es.svg';
import ITFlag from '../../../assets/flags/it.svg';
import PLFlag from '../../../assets/flags/pl.svg';

const flagMap: Record<string, any> = {
    en: ENFlag,
    es: ESFlag,
    it: ITFlag,
    pl: PLFlag,
};

type SquareFlagProps = {
    languageCode: string;
    size?: number;
    style?: any;
};

export const SquareFlag: FC<SquareFlagProps> = ({ languageCode, size, style }) => {
    const Flag = flagMap[languageCode];
    return Flag ? <Flag height={size || 22} style={style} width={size || 22} /> : null;
};
