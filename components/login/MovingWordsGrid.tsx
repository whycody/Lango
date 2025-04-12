import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marquee } from "@animatereactnative/marquee";
import CustomText from "../CustomText";

const MarqueeRow = ({ words, reverse }: { words: string[]; reverse?: boolean }) => {

  return (
    <Marquee
      speed={0.2 + Math.random()}
      style={{ marginTop: 10 }}
      reverse={reverse}
      frameRate={30}
    >
      <View style={{ flexDirection: 'row' }}>
        {[...Array(words.length).keys()].map((i) => {
          return (
            <View key={i} style={styles.wordBox}>
              <CustomText weight={"Bold"} style={styles.wordText}>{words[i]}</CustomText>
            </View>
          );
        })});
      </View>
    </Marquee>
  );
};

const styles = StyleSheet.create({
  marqueeContent: {
    flexDirection: 'row',
  },
  wordBox: {
    flex: 1,
    backgroundColor: '#2F4878',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginRight: 12,
  },
  wordText: {
    color: '#A0D5FF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MarqueeRow;
