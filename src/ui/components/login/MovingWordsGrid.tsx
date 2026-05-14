import React, { FC, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marquee } from '@animatereactnative/marquee';
import { useTheme } from '@react-navigation/native';

import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

type MarqueeRowProps = {
    loading: boolean;
    reverse?: boolean;
    words: string[];
};

export const MarqueeRow: FC<MarqueeRowProps> = ({ loading, reverse, words }) => {
    const randomizedSpeed = useMemo(() => 0.2 + Math.random(), [loading]);
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    return (
        <Marquee
            frameRate={10}
            reverse={reverse}
            speed={loading ? 0 : randomizedSpeed}
            style={styles.marquee}
        >
            <View style={styles.row}>
                {words.map((word, i) => (
                    <View key={i} style={styles.wordBox}>
                        <CustomText style={styles.wordText} weight={'Bold'}>
                            {word}
                        </CustomText>
                    </View>
                ))}
            </View>
        </Marquee>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        marquee: {
            marginTop: 10,
        },
        marqueeContent: {
            flexDirection: 'row',
        },
        row: {
            flexDirection: 'row',
        },
        wordBox: {
            backgroundColor: colors.primary800,
            borderRadius: 4,
            flex: 1,
            flexDirection: 'row',
            marginRight: 10,
            paddingHorizontal: 20,
            paddingVertical: 17,
        },
        wordText: {
            color: colors.white,
            fontSize: 16,
            fontWeight: '600',
            textAlignVertical: 'center',
        },
    });
