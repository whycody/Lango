import React, {
    createContext,
    FC,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import uuid from 'react-native-uuid';

import { bundleMembersApi } from '../api/bundle-members-api';
import { wordsBundlesApi } from '../api/words-bundles-api';
import { useBundleMemberRepository, useWordsBundleRepository } from '../hooks/repo';
import { BundleJoinCode, BundleMember, BundleMemberRole, WordsBundle } from '../types';
import { getCurrentISO } from '../utils/dateUtil';
import {
    findChangedItems,
    findLatestUpdatedAt,
    getUnsyncedItems,
    mergeLocalAndServer,
    syncInBatches,
    updateLocalItems,
} from '../utils/sync';
import { useAppInitializer } from './AppInitializerContext';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export type EnrichedWordsBundle = WordsBundle & {
    membership: BundleMember | undefined;
};

interface WordsBundleContextProps {
    bundles: EnrichedWordsBundle[];
    createBundle: (
        title: string,
        description: string | undefined,
        visibility: WordsBundle['visibility'],
    ) => WordsBundle;
    editBundle: (updatedBundle: Partial<WordsBundle> & { id: string }) => void;
    generateInvitationCode: (
        bundleId: string,
        role: Extract<BundleMemberRole, 'editor' | 'viewer'>,
    ) => Promise<BundleJoinCode | null>;
    joinWithCode: (code: string) => Promise<BundleMember | null>;
    langBundles: EnrichedWordsBundle[];
    loading: boolean;
    removeBundle: (id: string) => void;
    syncBundles: () => Promise<void>;
}

const WordsBundleContext = createContext<WordsBundleContextProps>({
    bundles: [],
    createBundle: () => {
        throw new Error('WordsBundleProvider not mounted');
    },
    editBundle: () => {},
    generateInvitationCode: () => Promise.resolve(null),
    joinWithCode: () => Promise.resolve(null),
    langBundles: [],
    loading: true,
    removeBundle: () => {},
    syncBundles: () => Promise.resolve(),
});

export const WordsBundleProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { initialLoad } = useAppInitializer();
    const { user } = useAuth();
    const { mainLang, translationLang } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [bundles, setBundles] = useState<WordsBundle[]>(initialLoad!.wordsBundles);
    const [members, setMembers] = useState<BundleMember[]>(initialLoad!.bundleMembers);

    const { getAllWordsBundles, saveWordsBundles, updateWordsBundle } = useWordsBundleRepository();
    const { getAllBundleMembers, saveBundleMembers } = useBundleMemberRepository();

    const syncingBundles = useRef(false);
    const syncingMembers = useRef(false);

    const enrichedBundles = useMemo<EnrichedWordsBundle[]>(
        () =>
            bundles.map(bundle => ({
                ...bundle,
                membership: members.find(
                    member => member.bundleId === bundle.id && member.userId === user?.userId,
                ),
            })),
        [bundles, members, user?.userId],
    );

    const langBundles = useMemo(
        () =>
            enrichedBundles.filter(
                bundle =>
                    !bundle.removed &&
                    bundle.mainLang === mainLang &&
                    bundle.translationLang === translationLang,
            ),
        [enrichedBundles, mainLang, translationLang],
    );

    const createBundle = (
        title: string,
        description: string | undefined,
        visibility: WordsBundle['visibility'],
    ): WordsBundle => {
        const now = getCurrentISO();
        const newBundle: WordsBundle = {
            description,
            id: uuid.v4(),
            locallyUpdatedAt: now,
            mainLang,
            ownerId: user!.userId,
            removed: false,
            synced: false,
            title,
            translationLang,
            updatedAt: undefined,
            visibility,
        };

        const ownerMember: BundleMember = {
            bundleId: newBundle.id,
            id: uuid.v4(),
            locallyUpdatedAt: now,
            removed: false,
            role: 'owner',
            subscribed: true,
            synced: false,
            updatedAt: undefined,
            userId: user!.userId,
        };

        const updatedBundles = [newBundle, ...bundles];
        const updatedMembers = [ownerMember, ...members];

        setBundles(updatedBundles);
        setMembers(updatedMembers);
        saveWordsBundles([newBundle]);
        saveBundleMembers([ownerMember]);
        syncWordsBundles(updatedBundles);
        syncBundleMembers(updatedMembers);

        return newBundle;
    };

    const editBundle = (updatedBundle: Partial<WordsBundle> & { id: string }) => {
        const locallyUpdatedAt = getCurrentISO();

        const updatedBundles = bundles.map(bundle =>
            bundle.id === updatedBundle.id
                ? { ...bundle, ...updatedBundle, locallyUpdatedAt, synced: false }
                : bundle,
        );

        const changed = updatedBundles.find(bundle => bundle.id === updatedBundle.id)!;

        setBundles(updatedBundles);
        updateWordsBundle(changed);
        syncWordsBundles(updatedBundles);
    };

    const removeBundle = (id: string) => {
        const updatedBundles = bundles.map(bundle =>
            bundle.id === id
                ? { ...bundle, locallyUpdatedAt: getCurrentISO(), removed: true, synced: false }
                : bundle,
        );

        updateWordsBundle(updatedBundles.find(bundle => bundle.id === id)!);
        setBundles(updatedBundles);
        syncWordsBundles(updatedBundles);
    };

    const generateInvitationCode = async (
        bundleId: string,
        role: Extract<BundleMemberRole, 'editor' | 'viewer'>,
    ) => {
        const result = await wordsBundlesApi.generateBundleInvitationCode(bundleId, role);
        return result.kind === 'ok' ? result.data : null;
    };

    const joinWithCode = async (code: string) => {
        const result = await wordsBundlesApi.joinBundleWithCode(code);
        const member = result.kind === 'ok' ? result.data : null;

        if (member) {
            const updatedMembers = [member, ...members.filter(m => m.id !== member.id)];
            setMembers(updatedMembers);
            saveBundleMembers([member]);
            syncWordsBundles();
        }

        return member;
    };

    const syncWordsBundles = async (inputBundles?: WordsBundle[]) => {
        try {
            if (syncingBundles.current) return;
            syncingBundles.current = true;
            const bundlesList = inputBundles ?? (await getAllWordsBundles());
            const unsyncedBundles = getUnsyncedItems<WordsBundle>(bundlesList);
            const { synced: serverUpdates } = await syncInBatches<WordsBundle>(
                unsyncedBundles,
                bundlesChunk => wordsBundlesApi.syncWordsBundlesOnServer(bundlesChunk),
            );

            const updatedBundles = updateLocalItems<WordsBundle>(bundlesList, serverUpdates);
            const latestUpdatedAt = findLatestUpdatedAt<WordsBundle>(updatedBundles);
            const result = await wordsBundlesApi.fetchUpdatedWordsBundles(latestUpdatedAt);
            const serverBundles = result.kind === 'ok' ? result.data : [];
            const mergedBundles = mergeLocalAndServer<WordsBundle>(updatedBundles, serverBundles);
            const changedBundles = findChangedItems<WordsBundle>(bundlesList, mergedBundles);

            if (changedBundles.length > 0) {
                setBundles(mergedBundles);
                await saveWordsBundles(changedBundles);
            }
        } catch (error) {
            console.log('Error syncing words bundles:', error);
        } finally {
            syncingBundles.current = false;
        }
    };

    const syncBundleMembers = async (inputMembers?: BundleMember[]) => {
        try {
            if (syncingMembers.current) return;
            syncingMembers.current = true;
            const membersList = inputMembers ?? (await getAllBundleMembers());
            const unsyncedMembers = getUnsyncedItems<BundleMember>(membersList);
            const { synced: serverUpdates } = await syncInBatches<BundleMember>(
                unsyncedMembers,
                membersChunk => bundleMembersApi.syncBundleMembersOnServer(membersChunk),
            );

            const updatedMembers = updateLocalItems<BundleMember>(membersList, serverUpdates);
            const latestUpdatedAt = findLatestUpdatedAt<BundleMember>(updatedMembers);
            const result = await bundleMembersApi.fetchUpdatedBundleMembers(latestUpdatedAt);
            const serverMembers = result.kind === 'ok' ? result.data : [];
            const mergedMembers = mergeLocalAndServer<BundleMember>(updatedMembers, serverMembers);
            const changedMembers = findChangedItems<BundleMember>(membersList, mergedMembers);

            if (changedMembers.length > 0) {
                setMembers(mergedMembers);
                await saveBundleMembers(changedMembers);
            }
        } catch (error) {
            console.log('Error syncing bundle members:', error);
        } finally {
            syncingMembers.current = false;
        }
    };

    const syncBundles = async () => {
        await syncWordsBundles();
        await syncBundleMembers();
    };

    const loadData = async () => {
        try {
            setLoading(true);
            await syncBundles();
        } catch (error) {
            console.log('Error loading words bundles from storage:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <WordsBundleContext.Provider
            value={{
                bundles: enrichedBundles,
                createBundle,
                editBundle,
                generateInvitationCode,
                joinWithCode,
                langBundles,
                loading,
                removeBundle,
                syncBundles,
            }}
        >
            {children}
        </WordsBundleContext.Provider>
    );
};

export const useWordsBundle = (): WordsBundleContextProps => {
    const context = useContext(WordsBundleContext);
    if (!context) {
        throw new Error('useWordsBundle must be used within a WordsBundleProvider');
    }
    return context;
};
