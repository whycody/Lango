import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from 'react-native-paper';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { CustomTheme } from '../../Theme';
import { CustomText } from '../CustomText';
import { StatisticItem } from '../home';

type FlashcardsHeaderProps = {
    allFlashcardsCount: number;
    avgGradeThreeProb: number;
    langoWords: number;
    numberOfWords: number;
};

export const FlashcardsHeader = memo<FlashcardsHeaderProps>(
    ({ allFlashcardsCount, avgGradeThreeProb, langoWords, numberOfWords }) => {
        const { colors } = useTheme() as CustomTheme;
        const { t } = useTranslation();
        const styles = getStyles(colors);

        return (
            <View style={styles.container}>
                <CustomText style={styles.title} weight="Bold">
                    {t('flashcards')}
                </CustomText>
                <CustomText style={styles.subtitle}>
                    {t('soFar', { wordsCount: numberOfWords }) +
                        ' ' +
                        (langoWords > 0 ? t('brag', { langoWords }) : t('nextTime'))}
                </CustomText>
                <View style={styles.statsContainer}>
                    <StatisticItem
                        description={t('words')}
                        icon={'layers-outline'}
                        label={`${numberOfWords}`}
                        style={styles.statisticItem}
                    />
                    <StatisticItem
                        description={t('langoWords')}
                        icon={'layers-outline'}
                        label={`${langoWords}`}
                        style={styles.statisticItem}
                    />
                </View>
                {allFlashcardsCount > 0 && (
                    <>
                        <CustomText style={styles.subtitle}>
                            {t('avgGradeThree', {
                                avgGrade: (avgGradeThreeProb * 100).toFixed(0),
                            }) +
                                ' ' +
                                (avgGradeThreeProb >= 0.5 ? t('goodJob') : t('badJob'))}
                        </CustomText>
                        <View style={styles.progressBarContainer}>
                            <ProgressBar
                                animatedValue={avgGradeThreeProb}
                                color={colors.primary}
                                style={styles.progressBar}
                            />
                        </View>
                    </>
                )}
            </View>
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        container: {
            backgroundColor: colors.background,
        },
        progressBar: {
            backgroundColor: colors.cardAccent300,
            borderRadius: spacing.s,
            height: 7,
        },
        progressBarContainer: {
            marginBottom: 6,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 16,
        },
        statisticItem: {
            flex: 1,
        },
        statsContainer: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 12,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        subtitle: {
            color: colors.white300,
            fontSize: 15,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 3,
        },
        title: {
            color: colors.white,
            fontSize: 24,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
    });
