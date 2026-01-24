import React, { FC, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import SquareFlag from "./SquareFlag";
import { FlatList, Pressable, StyleSheet, TextInputProps, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../../constants/margins";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import CustomText from "./CustomText";

type WordInputProps = TextInputProps & {
  word: string;
  active: boolean;
  onWordCommit?: (word: string) => void;
  onWordChange?: (word: string) => void;
  languageCode: string;
  suggestions?: string[];
  style?: any;
};

const WordInput: FC<WordInputProps> =
  forwardRef(({ word, active, onWordCommit, onWordChange, languageCode, suggestions, style, ...rest }, ref) => {
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
      if (!active) return;
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
      onWordChange(suggestion);
      onWordCommit(suggestion);
    };

    return (
      <View>
        <View style={[styles.inputContainer, style]}>
          <SquareFlag size={30} style={{ marginRight: 10 }} languageCode={languageCode}/>
          <BottomSheetTextInput
            ref={inputRef}
            style={styles.input}
            cursorColor={active ? colors.primary : 'transparent'}
            autoCapitalize={'none'}
            textContentType={'none'}
            autoCorrect={true}
            multiline={true}
            value={internalWord}
            scrollEnabled={true}
            onFocus={setFocused}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
            {...rest}
          />
        </View>
        {currentSuggestions.length > 0 && focused && (
          <FlatList
            data={currentSuggestions}
            scrollEnabled={false}
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
    paddingHorizontal: MARGIN_HORIZONTAL,
    backgroundColor: colors.background,
    fontSize: 16,
    minHeight: 42,
    lineHeight: 30,
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