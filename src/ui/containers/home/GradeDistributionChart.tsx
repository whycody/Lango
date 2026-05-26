import React, { FC, useMemo } from 'react';
import { StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory-native';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { useWordsMLStatesContext } from '../../../store';
import { CustomTheme } from '../../Theme';
import { ChartCard } from './ChartCard';
import { GradeDistributionColorBar } from './GradeDistributionColorBar';

type GradeDistributionChartProps = {
    style?: StyleProp<ViewStyle>;
};

type ChartDatum = {
    x: number;
    y: number;
};

const BUCKETS: number[] = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

const AXIS_STYLE_BASE = (whiteColor: string) => ({
    axis: { opacity: 0.15, stroke: whiteColor },
    grid: { stroke: 'transparent' },
    tickLabels: { fill: whiteColor, fontSize: 9, opacity: 0.5 },
});

function buildChartData(
    langWordsMLStates: { gradeThreeProb: number }[] | null | undefined,
): ChartDatum[] {
    const counts: ChartDatum[] = BUCKETS.map(bucket => ({ x: bucket, y: 0 }));

    (langWordsMLStates ?? []).forEach(state => {
        const bucketIndex = Math.min(Math.round(state.gradeThreeProb * 10), 10);
        counts[bucketIndex].y += 1;
    });

    const total = counts.reduce((sum, c) => sum + c.y, 0);
    const threshold = total * 0.01;
    const qualified = counts.map((c, i) => ({ ...c, i })).filter(c => c.y >= threshold);

    if (qualified.length === 0) return counts;

    const minI = Math.max(0, qualified[0].i - 1);
    const maxI = Math.min(counts.length - 1, qualified[qualified.length - 1].i + 1);
    return counts.slice(minI, maxI + 1);
}

export const GradeDistributionChart: FC<GradeDistributionChartProps> = ({ style }) => {
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;
    const { width } = useWindowDimensions();
    const { langWordsMLStates } = useWordsMLStatesContext();

    const chartWidth = width - MARGIN_HORIZONTAL * 2;

    const data = useMemo(() => buildChartData(langWordsMLStates), [langWordsMLStates]);

    const xMin = data[0].x - 0.1;
    const xMax = data[data.length - 1].x + 0.1;
    const plotWidth = chartWidth - MARGIN_HORIZONTAL * 1.5 - MARGIN_HORIZONTAL;
    const barWidth = (plotWidth / (xMax - xMin)) * 0.1 - 2;

    const axisStyle = AXIS_STYLE_BASE(colors.white);
    const axisLabelStyle = { fill: colors.white, fontSize: 9, opacity: 0.5 };

    return (
        <ChartCard
            style={style}
            subtitle={t('gradeDistributionDesc')}
            title={t('gradeDistribution')}
        >
            <View style={styles.chartWrapper}>
                <VictoryChart
                    domain={{ x: [xMin, xMax] }}
                    height={230}
                    width={chartWidth}
                    padding={{
                        bottom: 41,
                        left: MARGIN_HORIZONTAL * 1.5,
                        right: MARGIN_HORIZONTAL,
                        top: 10,
                    }}
                >
                    <VictoryAxis
                        label={t('gradeDistributionAxisX')}
                        tickFormat={(v: number) => v.toFixed(1)}
                        tickValues={data.map(d => d.x)}
                        style={{
                            ...axisStyle,
                            axisLabel: { ...axisLabelStyle, padding: 30 },
                        }}
                    />
                    <VictoryAxis
                        dependentAxis
                        axisValue={xMin}
                        style={axisStyle}
                        tickFormat={(v: number) => String(Math.round(v))}
                    />
                    <VictoryAxis
                        dependentAxis
                        tickFormat={() => ''}
                        style={{
                            axis: { stroke: 'transparent' },
                            grid: { opacity: 0.06, stroke: colors.white },
                            ticks: { stroke: 'transparent' },
                        }}
                    />
                    <VictoryBar
                        data={data}
                        dataComponent={<GradeDistributionColorBar barWidth={barWidth} />}
                    />
                </VictoryChart>
            </View>
        </ChartCard>
    );
};

const styles = StyleSheet.create({
    chartWrapper: {
        marginTop: MARGIN_VERTICAL / 2,
        overflow: 'hidden',
    },
});
