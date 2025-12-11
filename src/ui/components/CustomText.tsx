import React, { FC } from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

interface CustomTextProps extends TextProps {
  weight?: 'Regular' | 'SemiBold' | 'Bold' | 'Black';
}

const CustomText: FC<CustomTextProps> = ({ weight = 'Regular', style, children, ...props }) => {
  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const boldText = part.slice(1, -1);
        return (
          <Text key={index} style={{ fontFamily: weight == `Bold` ? `Montserrat-Black` : `Montserrat-Bold` }}>
            {boldText}
          </Text>
        );
      }
      return part;
    });
  };

  const textToDisplay = typeof children === 'string' ? children : '';

  return (
    <Text style={[styles.text, { fontFamily: `Montserrat-${weight}` }, style]} {...props}>
      {renderTextWithBold(textToDisplay)}
    </Text>
  );
};

export default CustomText;

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
});
