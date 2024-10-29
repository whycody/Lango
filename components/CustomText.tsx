import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface CustomTextProps extends TextProps {
  weight?: 'Regular' | 'SemiBold' | 'Bold' | 'Black';
}

const CustomText: React.FC<CustomTextProps> = ({ weight = 'Regular', style, children, ...props }) => {
  let fontFamily = `Montserrat-${weight}`;

  return (
    <Text style={[styles.text, { fontFamily }, style,]} {...props}>
      {children}
    </Text>
  );
};

export default CustomText;

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
});
