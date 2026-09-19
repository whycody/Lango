import React, { FC, ReactNode } from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { fontFamily } from '../../constants/typography';
import { TranslationKey } from '../../types';

type FontWeight = keyof typeof fontFamily;

interface CustomTextProps extends TextProps {
    text?: string;
    tx?: TranslationKey;
    txOptions?: Record<string, unknown>;
    weight?: FontWeight;
}

export const CustomText: FC<CustomTextProps> = ({
    children,
    style,
    text,
    tx,
    txOptions,
    weight = 'Regular',
    ...props
}) => {
    const { t } = useTranslation();
    const baseFont = fontFamily[weight];

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
            {renderContent(tx ? t(tx, txOptions) : (text ?? children))}
        </Text>
    );
};

const styles = StyleSheet.create({
    bold: {
        fontFamily: fontFamily.Bold,
    },
    extraBold: {
        fontFamily: fontFamily.Black,
    },
    text: {
        fontSize: 16,
    },
});

