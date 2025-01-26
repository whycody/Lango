import React, { FC, useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { useTheme } from "@react-navigation/native";
import SquareFlag from "./SquareFlag";
import { View, StyleSheet, Platform, TextInput } from "react-native";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

type WordInputProps = {
  word: string;
  onWordChange: (word: string) => void;
  languageCode: string;
  style?: any;
};

const WordInput: FC<WordInputProps> = forwardRef(({ word, onWordChange, languageCode, style }, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [internalWord, setInternalWord] = useState(word);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setInternalWord(word);
  }, [word]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clearWord: () => setInternalWord(''),
    getWord: () => internalWord,
  }));

  const handleTextChange = (newWord: string) => {
    setInternalWord(newWord);
  };

  const handleBlur = () => {
    onWordChange(internalWord);
  };

  return (
    <View style={[styles.inputContainer, style]}>
      <SquareFlag size={30} style={{ marginRight: 10 }} languageCode={languageCode}/>
      {Platform.OS == 'ios' ?
        <BottomSheetTextInput
          ref={inputRef}
          style={styles.input}
          cursorColor={colors.primary}
          autoCapitalize={'none'}
          autoCorrect={false}
          value={internalWord}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
        /> :
        <TextInput
          ref={inputRef}
          style={styles.input}
          cursorColor={colors.primary}
          autoCapitalize={'none'}
          autoCorrect={false}
          value={internalWord}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
        />
      }
    </View>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontWeight: 'semibold',
    color: colors.primary300,
    paddingLeft: MARGIN_HORIZONTAL,
    backgroundColor: colors.background,
    fontSize: 17,
    height: 40
  },
});

export default WordInput;