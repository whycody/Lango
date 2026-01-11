import React, { FC, ReactNode } from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

type FontWeight = 'Regular' | 'SemiBold' | 'Bold' | 'Black';

interface CustomTextProps extends TextProps {
  weight?: FontWeight;
}

const FONT_MAP: Record<FontWeight, string> = {
  Regular: 'Montserrat-Regular',
  SemiBold: 'Montserrat-SemiBold',
  Bold: 'Montserrat-Bold',
  Black: 'Montserrat-Black',
};

const CustomText: FC<CustomTextProps> = ({ weight = 'Regular', style, children, ...props }) => {
  const baseFont = FONT_MAP[weight];

  const renderContent = (content: ReactNode): ReactNode => {
    if (typeof content !== 'string') return content;

    return content.split(/(\*[^*]+\*)/g).map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <Text key={index} style={[styles.text, style, styles.bold]}>
            {part.slice(1, -1)}
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <Text style={[styles.text, { fontFamily: baseFont }, style]} {...props}>
      {renderContent(children)}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
  bold: {
    fontFamily: FONT_MAP.Bold,
  },
});

export default CustomText;