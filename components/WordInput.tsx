import React, { FC, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import SquareFlag from "./SquareFlag";
import { FlatList, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import CustomText from "./CustomText";

type WordInputProps = {
  word: string;
  onWordCommit?: (word: string) => void;
  onWordChange?: (word: string) => void;
  languageCode: string;
  suggestions?: string[];
  style?: any;
};

const WordInput: FC<WordInputProps> = forwardRef(({ word, onWordCommit, onWordChange, languageCode, suggestions, style }, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [focused, setFocused] = useState(false);

  const [internalWord, setInternalWord] = useState(word);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setInternalWord(word);
  }, [word]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clearWord: () => setInternalWord(''),
    getWord: () => internalWord,
  }));

  useEffect(() => {
    const filteredSuggestions = suggestions ? suggestions.filter((suggestion) =>
      suggestion.toLowerCase().startsWith(internalWord.toLowerCase()) && suggestion.toLowerCase() !== internalWord.toLowerCase()
    ).slice(0, 2) : [];

    setCurrentSuggestions(filteredSuggestions);
  }, [internalWord, suggestions]);

  const handleTextChange = (newWord: string) => {
    setInternalWord(newWord);
    onWordChange?.(newWord);
  };

  const handleBlur = () => {
    onWordCommit?.(internalWord);
    setFocused(false);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setCurrentSuggestions([]);
    setInternalWord(suggestion);
    onWordCommit(suggestion);
  };

  return (
    <View>
      <View style={[styles.inputContainer, style]}>
        <SquareFlag size={30} style={{ marginRight: 10 }} languageCode={languageCode}/>
        {Platform.OS == 'ios' ?
          <BottomSheetTextInput
            ref={inputRef}
            style={styles.input}
            cursorColor={colors.primary}
            autoCapitalize={'none'}
            autoCorrect={true}
            value={internalWord}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
          /> :
          <TextInput
            ref={inputRef}
            style={styles.input}
            cursorColor={colors.primary}
            autoCorrect={true}
            autoCapitalize={'none'}
            textContentType={'none'}
            value={internalWord}
            onFocus={setFocused}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
          />
        }
      </View>
      {currentSuggestions.length > 0 && focused && (
        <FlatList
          data={currentSuggestions}
          keyboardShouldPersistTaps={'always'}
          keyExtractor={(index) => index.toString()}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleSuggestionPress(item)}>
              <View style={styles.suggestionItem}>
                <CustomText style={styles.suggestionText}>{item}</CustomText>
              </View>
            </Pressable>
          )}
          style={styles.suggestionsList}
        />
      )}
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
    fontFamily: `Montserrat-Regular`,
    color: colors.primary300,
    paddingLeft: MARGIN_HORIZONTAL,
    backgroundColor: colors.background,
    fontSize: 16,
    height: 42,
  },
  suggestionsList: {
    marginTop: 10,
    borderColor: colors.border,
  },
  suggestionItem: {
    marginTop: 5,
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.primary300,
  },
});

export default WordInput;