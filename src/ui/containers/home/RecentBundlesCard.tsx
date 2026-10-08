import { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { ScreenName, TabName } from '../../../navigation/navigationTypes';
import { BundleListItem } from '../../../screens/bundles/dashboard/components';
import { useWordsBundle } from '../../../store';
import { EnrichedWordsBundle } from '../../../store/WordsBundleContext';
import { ActionButton, Header } from '../../components';
import { HomeScreenNavProp } from '../../screens/HomeScreen';

const RECENT_BUNDLES_COUNT = 2;

interface RecentBundlesCardProps {
    navigation: HomeScreenNavProp;
    onPlayPress: (bundle: EnrichedWordsBundle) => void;
}

export const RecentBundlesCard: FC<RecentBundlesCardProps> = ({ navigation, onPlayPress }) => {
    const { langBundles, touchBundleInteraction } = useWordsBundle();

    const recentBundles = langBundles.slice(0, RECENT_BUNDLES_COUNT);

    if (recentBundles.length === 0) return null;

    const handleBundlePress = (bundleId: string) => {
        touchBundleInteraction(bundleId);
        navigation.navigate(ScreenName.BundleNavigator, { bundleId, isNewBundle: false });
    };

    const handleSeeAllPress = () => {
        navigation.navigate(TabName.Bundles);
    };

    return (
        <View style={styles.root}>
            <Header style={styles.header} subtitleTx="recentBundlesDesc" titleTx="recentBundles" />
            {recentBundles.map((bundle, index) => (
                <BundleListItem
                    key={bundle.id}
                    bundle={bundle}
                    index={index}
                    onPlayPress={onPlayPress}
                    onPress={() => handleBundlePress(bundle.id)}
                />
            ))}
            <ActionButton
                icon="chevron-forward"
                labelTx="see_all"
                style={styles.seeAllButton}
                onPress={handleSeeAllPress}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: spacing.l,
    },
    root: {
        paddingHorizontal: MARGIN_HORIZONTAL,
        paddingTop: MARGIN_VERTICAL,
    },
    seeAllButton: {
        marginTop: spacing.l,
    },
});
