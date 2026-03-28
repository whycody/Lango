import React, { FC, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marquee } from '@animatereactnative/marquee';

import { CustomText } from '..';

type MarqueeRowProps = {
    loading: boolean;
    reverse?: boolean;
    words: string[];
};

export const MarqueeRow: FC<MarqueeRowProps> = ({ loading, reverse, words }) => {
    const randomizedSpeed = useMemo(() => 0.2 + Math.random(), [loading]);

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

const styles = StyleSheet.create({
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
        backgroundColor: '#2F4878',
        flex: 1,
        flexDirection: 'row',
        marginRight: 10,
        paddingHorizontal: 20,
        paddingVertical: 17,
    },
    wordText: {
        color: '#A0D5FF',
        fontSize: 16,
        fontWeight: '600',
    },
});
