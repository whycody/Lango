import { FC } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { ActionButton } from '../../../../ui/components';

interface BundleActionButtonsProps {
    buttonStyle?: StyleProp<ViewStyle>;
    canAddWords: boolean;
    primaryButtonStyle?: StyleProp<ViewStyle>;
    hasWords: boolean;
    isBundleWordsFetching: boolean;
    isJoiningBundle: boolean;
    isPreview: boolean;
    isPrivatePreview: boolean;
    onAddToMyBundlesPress: () => void;
    onAddWordPress: () => void;
    onJoinWithCodePress: () => void;
    onShareBundleLinkPress: () => void;
    onStartSessionPress: () => void;
}

export const BundleActionButtons: FC<BundleActionButtonsProps> = ({
    buttonStyle,
    canAddWords,
    hasWords,
    isBundleWordsFetching,
    isJoiningBundle,
    isPreview,
    isPrivatePreview,
    onAddToMyBundlesPress,
    onAddWordPress,
    onJoinWithCodePress,
    onShareBundleLinkPress,
    onStartSessionPress,
    primaryButtonStyle,
}) => (
    <>
        {canAddWords && (
            <ActionButton
                active={!isBundleWordsFetching}
                labelTx="bundle_details.add_word"
                style={buttonStyle}
                onPress={onAddWordPress}
            />
        )}
        {isPreview && !isPrivatePreview && (
            <ActionButton
                active={!isJoiningBundle && hasWords}
                icon="folder-multiple-plus-outline"
                iconFamily="material-community"
                labelTx="bundle_details.add_to_my_bundles"
                loading={isJoiningBundle}
                style={buttonStyle}
                onPress={onAddToMyBundlesPress}
            />
        )}
        {isPrivatePreview && (
            <ActionButton
                icon="share-outline"
                labelTx="bundle_details.share_bundle"
                style={buttonStyle}
                onPress={onShareBundleLinkPress}
            />
        )}
        {isPrivatePreview ? (
            <ActionButton
                primary
                icon="key-outline"
                labelTx="bundle_details.join_with_code"
                style={primaryButtonStyle ?? buttonStyle}
                onPress={onJoinWithCodePress}
            />
        ) : (
            <ActionButton
                primary
                active={hasWords}
                icon="play"
                labelTx="bundle_details.start_session"
                style={primaryButtonStyle ?? buttonStyle}
                onPress={onStartSessionPress}
            />
        )}
    </>
);
