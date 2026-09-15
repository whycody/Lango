import { FC, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Circle, Svg } from 'react-native-svg';

import { CustomTheme } from '../../../../ui/Theme';
import { MASTERY_RING_DEFAULT_STROKE_WIDTH, ROTATION_DURATION_MS } from '../constants';
import { RingSegmentCount } from '../types';
import { computeMasteryRingSegments } from '../utils';

type MasteryRingProps = {
    learningCount: number;
    masteredCount: number;
    reviewCount: number;
    size: number;
    strokeWidth?: number;
};

export const MasteryRing: FC<MasteryRingProps> = ({
    learningCount,
    masteredCount,
    reviewCount,
    size,
    strokeWidth = MASTERY_RING_DEFAULT_STROKE_WIDTH,
}) => {
    const { colors } = useTheme() as CustomTheme;

    const totalWordCount = learningCount + reviewCount + masteredCount;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const counts: RingSegmentCount[] = [
        { color: colors.red, count: learningCount, label: 'learning' },
        { color: colors.yellow, count: reviewCount, label: 'review' },
        { color: colors.green, count: masteredCount, label: 'mastered' },
    ];

    const segments = computeMasteryRingSegments(counts, circumference);
    const rotation = useRef(new Animated.Value(0)).current;

    const hasWords = totalWordCount > 0;

    useEffect(() => {
        if (!hasWords) return;

        rotation.setValue(0);
        const animation = Animated.loop(
            Animated.timing(rotation, {
                duration: ROTATION_DURATION_MS,
                easing: Easing.linear,
                toValue: 1,
                useNativeDriver: true,
            }),
        );
        animation.start();

        return () => animation.stop();
    }, [rotation, hasWords]);

    const rotate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const containerStyle = {
        height: size,
        transform: [{ rotate }],
        width: size,
    };

    const commonCircleProps = {
        cx: center,
        cy: center,
        fill: 'none',
        r: radius,
        strokeWidth,
    };

    return (
        <Animated.View style={containerStyle}>
            <Svg height={size} width={size}>
                {!hasWords ? (
                    <Circle {...commonCircleProps} stroke={colors.cardAccent300} />
                ) : (
                    segments.map((segment, index) => (
                        <Circle
                            {...commonCircleProps}
                            key={index}
                            stroke={segment.color}
                            strokeDasharray={segment.dashArray}
                            strokeDashoffset={segment.dashOffset}
                            strokeLinecap="round"
                        />
                    ))
                )}
            </Svg>
        </Animated.View>
    );
};
