import React, { FC } from 'react';
import { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';

import { getLevelColor } from '../../../utils/getLevelColor';

type Scale = {
    y: (value: number) => number;
};

type Datum = {
    x: number;
    y: number;
};

type GradeDistributionColorBarProps = {
    barWidth?: number;
    datum?: Datum;
    scale?: Scale;
    x?: number;
    y?: number;
};

export const GradeDistributionColorBar: FC<GradeDistributionColorBarProps> = ({
    barWidth = 0,
    datum,
    scale,
    x = 0,
    y = 0,
}) => {
    if (!datum) return null;

    const barH = Math.max((scale?.y(0) ?? 0) - (scale?.y(datum.y) ?? 0), 0);
    const barX = x - barWidth / 2;
    const barY = scale?.y(datum.y) ?? y;
    const r = Math.min(4, barH);
    const w = barWidth;
    const d = `M${barX},${barY + barH} L${barX},${barY + r} Q${barX},${barY} ${barX + r},${barY} L${barX + w - r},${barY} Q${barX + w},${barY} ${barX + w},${barY + r} L${barX + w},${barY + barH} Z`;
    const color = getLevelColor(datum.x);
    const gradId = `barGrad_${String(datum.x).replace('.', '_')}`;

    return (
        <>
            <Defs>
                <SvgLinearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                    <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
                </SvgLinearGradient>
            </Defs>
            <Path d={d} fill={`url(#${gradId})`} />
        </>
    );
};
