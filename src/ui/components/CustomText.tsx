import React, { FC, ReactNode } from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TranslationKey } from '../../types';

type FontWeight = 'Regular' | 'SemiBold' | 'Bold' | 'Black';

interface CustomTextProps extends TextProps {
    text?: string;
    tx?: TranslationKey;
    weight?: FontWeight;
}

const FONT_MAP: Record<FontWeight, string> = {
    Black: 'Montserrat-Black',
    Bold: 'Montserrat-Bold',
    Regular: 'Montserrat-Regular',
    SemiBold: 'Montserrat-SemiBold',
};

export const CustomText: FC<CustomTextProps> = ({
    children,
    style,
    text,
    tx,
    weight = 'Regular',
    ...props
}) => {
    const { t } = useTranslation();
    const baseFont = FONT_MAP[weight];

    const renderContent = (content: ReactNode): ReactNode => {
        if (typeof content !== 'string') return content;

        return content.split(/(\*[^*]+\*)/g).map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*')) {
                return (
                    <Text
                        key={index}
                        style={[
                            styles.text,
                            style,
                            weight == 'Bold' ? styles.extraBold : styles.bold,
                        ]}
                    >
                        {part.slice(1, -1)}
                    </Text>
                );
            }
            return part;
        });
    };

    return (
        <Text style={[styles.text, { fontFamily: baseFont }, style]} {...props}>
            {renderContent(tx ? t(tx) : (text ?? children))}
        </Text>
    );
};

const styles = StyleSheet.create({
    bold: {
        fontFamily: FONT_MAP.Bold,
    },
    extraBold: {
        fontFamily: FONT_MAP.Black,
    },
    text: {
        fontSize: 16,
    },
});
