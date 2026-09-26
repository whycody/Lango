import { FC } from 'react';
import { StyleSheet } from 'react-native';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../../constants/margins';
import { LibraryItem } from '../../../../ui/components/library';

interface BundleSubscribeToggleProps {
    subscribed: boolean;
    onToggle: () => void;
}

export const BundleSubscribeToggle: FC<BundleSubscribeToggleProps> = ({ onToggle, subscribed }) => (
    <LibraryItem
        descriptionTx="bundle_details.show_in_main_collection_desc"
        enabled={subscribed}
        index={0}
        labelTx="bundle_details.show_in_main_collection"
        style={styles.subscribedToggle}
        onPress={onToggle}
    />
);

const styles = StyleSheet.create({
    subscribedToggle: {
        marginHorizontal: MARGIN_HORIZONTAL,
        marginTop: MARGIN_VERTICAL,
    },
});
