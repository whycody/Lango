import { FC, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Circle, Svg } from 'react-native-svg';

import { CustomTheme } from '../../../../ui/Theme';
import { ROTATION_DURATION_MS } from '../constants';

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
    strokeWidth = 2.5,
}) => {
    const { colors } = useTheme() as CustomTheme;

    const total = learningCount + reviewCount + masteredCount;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const gap = total > 0 ? circumference * 0.04 : 0;

    const segments = [
        { color: colors.red, count: learningCount },
        { color: colors.yellow, count: reviewCount },
        { color: colors.green, count: masteredCount },
    ].filter(segment => segment.count > 0);

    let offset = 0;

    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (total === 0) return;

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
    }, [rotation, total]);

    const rotate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={{ height: size, transform: [{ rotate }], width: size }}>
            <Svg height={size} width={size}>
                {total === 0 ? (
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        fill="none"
                        r={radius}
                        stroke={colors.cardAccent300}
                        strokeWidth={strokeWidth}
                    />
                ) : (
                    segments.map((segment, index) => {
                        const length = (segment.count / total) * circumference - gap;
                        const dashArray = `${Math.max(length, 0)} ${circumference}`;
                        const dashOffset = -offset;
                        offset += (segment.count / total) * circumference;

                        return (
                            <Circle
                                key={index}
                                cx={size / 2}
                                cy={size / 2}
                                fill="none"
                                origin={`${size / 2}, ${size / 2}`}
                                r={radius}
                                rotation={-90}
                                stroke={segment.color}
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashOffset}
                                strokeLinecap="round"
                                strokeWidth={strokeWidth}
                            />
                        );
                    })
                )}
            </Svg>
        </Animated.View>
    );
};
