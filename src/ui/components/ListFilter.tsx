import { forwardRef } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

interface ListFilterProps extends Omit<TextInputProps, "style"> {
  isSearching: boolean;
  onClear: () => void;
}

const ListFilter =
  forwardRef<TextInput, ListFilterProps>(({ isSearching, onClear, ...props }, ref) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
      <View style={styles.root}>
        <Ionicons
          name="search-sharp"
          size={22}
          color={isSearching ? colors.primary600 : colors.primary300}
          style={styles.icon}
        />
        <TextInput
          ref={ref}
          style={styles.textInput}
          cursorColor={colors.primary300}
          {...props}
        />
        {props.value && (
          <Ionicons
            name="close"
            size={22}
            color={colors.primary300}
            style={styles.clearIcon}
            onPress={onClear}
          />
        )}
      </View>
    );
  });

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    flex: 1,
  },
  icon: {
    marginLeft: 10,
    marginRight: 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    height: 50,
    fontSize: 18,
    color: colors.primary300,
  },
  clearIcon: {
    marginLeft: 5,
    marginRight: 10,
  },
});

export default ListFilter;