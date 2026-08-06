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
import { ObjectId } from 'bson';

import { bundleMembersApi } from '../api/bundle-members-api';
import { wordsBundlesApi } from '../api/words-bundles-api';
import { useBundleMemberRepository, useWordsBundleRepository } from '../hooks/repo';
import { BundleJoinCode, BundleMember, BundleMemberRole, WordsBundle } from '../types';
import { getCurrentISO } from '../utils/dateUtil';
import {
    applyUnauthorizedItems,
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
    editBundleMember: (updatedMember: Partial<BundleMember> & { id: string }) => void;
    generateInvitationCode: (
        bundleId: string,
        role: Extract<BundleMemberRole, 'editor' | 'viewer'>,
    ) => Promise<BundleJoinCode | null>;
    deleteBundlePhysically: (bundleId: string) => Promise<void>;
    joinWithCode: (code: string) => Promise<BundleMember | null>;
    langBundles: EnrichedWordsBundle[];
    loading: boolean;
    members: BundleMember[];
    removeBundle: (id: string) => Promise<void>;
    setWordsBackfilled: (bundleId: string, backfilled: boolean) => void;
    syncBundles: () => Promise<void>;
}

const WordsBundleContext = createContext<WordsBundleContextProps>({
    bundles: [],
    createBundle: () => {
        throw new Error('WordsBundleProvider not mounted');
    },
    deleteBundlePhysically: () => Promise.resolve(),
    editBundle: () => {},
    editBundleMember: () => {},
    generateInvitationCode: () => Promise.resolve(null),
    joinWithCode: () => Promise.resolve(null),
    langBundles: [],
    loading: true,
    members: [],
    removeBundle: () => Promise.resolve(),
    setWordsBackfilled: () => {},
    syncBundles: () => Promise.resolve(),
});

export const WordsBundleProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { initialLoad } = useAppInitializer();
    const { user } = useAuth();
    const { mainLang, translationLang } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [bundles, setBundles] = useState<WordsBundle[]>(initialLoad!.wordsBundles);
    const [members, setMembers] = useState<BundleMember[]>(initialLoad!.bundleMembers);

    const { deleteWordsBundle, getAllWordsBundles, saveWordsBundles, updateWordsBundle } =
        useWordsBundleRepository();
    const { deleteBundleMembersByIds, getAllBundleMembers, saveBundleMembers, updateBundleMember } =
        useBundleMemberRepository();

    const syncingBundles = useRef(false);
    const syncingMembers = useRef(false);
    const removingBundles = useRef(new Set<string>());

    const enrichedBundles = useMemo<EnrichedWordsBundle[]>(
        () =>
            bundles.map(bundle => ({
                ...bundle,
                membership: members.find(member => member.bundleId === bundle.id),
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
            bundleCreatedOnServer: false,
            description,
            id: new ObjectId().toHexString(),
            locallyUpdatedAt: now,
            mainLang,
            ownerId: user!.userId,
            removed: false,
            synced: false,
            title,
            translationLang,
            updatedAt: undefined,
            visibility,
            wordsBackfilled: true,
        };

        const ownerMember: BundleMember = {
            bundleId: newBundle.id,
            id: new ObjectId().toHexString(),
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
        syncWordsBundles(updatedBundles).then(() => syncBundleMembers(updatedMembers));

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

    const editBundleMember = (updatedMember: Partial<BundleMember> & { id: string }) => {
        const locallyUpdatedAt = getCurrentISO();

        const updatedMembers = members.map(member =>
            member.id === updatedMember.id
                ? { ...member, ...updatedMember, locallyUpdatedAt, synced: false }
                : member,
        );

        const changed = updatedMembers.find(member => member.id === updatedMember.id)!;

        setMembers(updatedMembers);
        updateBundleMember(changed);
        syncBundleMembers(updatedMembers);
    };

    const deleteBundlePhysically = async (bundleId: string) => {
        await deleteWordsBundle(bundleId);
        setBundles(prev => prev.filter(bundle => bundle.id !== bundleId));
    };

    const removeBundle = async (id: string) => {
        const bundle = bundles.find(b => b.id === id);
        if (!bundle) return;

        const removedBundle: WordsBundle = {
            ...bundle,
            locallyUpdatedAt: getCurrentISO(),
            removed: true,
            synced: false,
        };

        const result = await wordsBundlesApi.syncWordsBundlesOnServer([removedBundle]);

        if (result.kind !== 'ok' || result.data.synced.length === 0) {
            throw new Error('Could not remove bundle: no connection to server');
        }

        await deleteBundlePhysically(id);
    };

    const setWordsBackfilled = (bundleId: string, backfilled: boolean) => {
        const updatedBundles = bundles.map(bundle =>
            bundle.id === bundleId ? { ...bundle, wordsBackfilled: backfilled } : bundle,
        );

        const changed = updatedBundles.find(bundle => bundle.id === bundleId);

        setBundles(updatedBundles);
        if (changed) updateWordsBundle(changed);
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

            const syncedIds = new Set(serverUpdates.map(update => update.id));
            const updatedBundles = updateLocalItems<WordsBundle>(bundlesList, serverUpdates).map(
                bundle => ({
                    ...bundle,
                    bundleCreatedOnServer: bundle.bundleCreatedOnServer || syncedIds.has(bundle.id),
                }),
            );
            const latestUpdatedAt = findLatestUpdatedAt<WordsBundle>(updatedBundles);
            const result = await wordsBundlesApi.fetchUpdatedWordsBundles(latestUpdatedAt);
            const serverBundles = result.kind === 'ok' ? result.data : [];
            const mergedBundles = mergeLocalAndServer<WordsBundle>(
                updatedBundles,
                serverBundles,
            ).map(bundle => {
                const local = bundlesList.find(b => b.id === bundle.id);
                return {
                    ...bundle,
                    bundleCreatedOnServer: local ? bundle.bundleCreatedOnServer : true,
                    wordsBackfilled: local?.wordsBackfilled ?? false,
                };
            });
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
            const bundlesList = await getAllWordsBundles();
            const bundlesNotCreatedOnServer = new Set(
                bundlesList
                    .filter(bundle => !bundle.bundleCreatedOnServer)
                    .map(bundle => bundle.id),
            );
            const unsyncedMembers = getUnsyncedItems<BundleMember>(membersList).filter(
                member => !bundlesNotCreatedOnServer.has(member.bundleId),
            );
            const { rejectedIds, synced, unauthorized } = await syncInBatches<BundleMember>(
                unsyncedMembers,
                membersChunk => bundleMembersApi.syncBundleMembersOnServer(membersChunk),
            );

            const rejectedIdsSet = new Set(rejectedIds);
            const remainingMembers = membersList.filter(member => !rejectedIdsSet.has(member.id));

            const updatedMembers = applyUnauthorizedItems<BundleMember>(
                updateLocalItems<BundleMember>(remainingMembers, synced),
                unauthorized,
            );
            const latestUpdatedAt = findLatestUpdatedAt<BundleMember>(updatedMembers);
            const result = await bundleMembersApi.fetchUpdatedBundleMembers(latestUpdatedAt);
            const serverMembers = result.kind === 'ok' ? result.data : [];
            const mergedMembers = mergeLocalAndServer<BundleMember>(updatedMembers, serverMembers);
            const changedMembers = findChangedItems<BundleMember>(membersList, mergedMembers);

            if (rejectedIds.length > 0) {
                await deleteBundleMembersByIds(rejectedIds);
            }

            if (changedMembers.length > 0 || rejectedIds.length > 0) {
                setMembers(mergedMembers);
            }

            if (changedMembers.length > 0) {
                await saveBundleMembers(changedMembers);
            }
        } catch (error) {
            console.log('Error syncing bundle members:', error);
        } finally {
            syncingMembers.current = false;
        }
    };

    const fetchMissingBundles = async () => {
        try {
            const currentBundles = await getAllWordsBundles();
            const currentMembers = await getAllBundleMembers();
            const bundleIds = new Set(currentBundles.map(bundle => bundle.id));
            const missingBundleIds = [
                ...new Set(
                    currentMembers
                        .filter(member => !member.removed)
                        .map(member => member.bundleId)
                        .filter(bundleId => !bundleIds.has(bundleId)),
                ),
            ];

            if (missingBundleIds.length === 0) return;

            const bundlesResult = await wordsBundlesApi.fetchWordsBundlesByIds(missingBundleIds);
            const fetchedBundles = bundlesResult.kind === 'ok' ? bundlesResult.data : [];
            if (fetchedBundles.length === 0) return;

            const newBundles: WordsBundle[] = fetchedBundles.map(bundle => ({
                ...bundle,
                bundleCreatedOnServer: true,
                locallyUpdatedAt: bundle.updatedAt ?? getCurrentISO(),
                synced: true,
                wordsBackfilled: false,
            }));

            const updatedBundles = [...currentBundles, ...newBundles];
            setBundles(updatedBundles);
            await saveWordsBundles(newBundles);
        } catch (error) {
            console.log('Error fetching missing bundles:', error);
        }
    };

    const syncBundles = async () => {
        await syncWordsBundles();
        await syncBundleMembers();
        await fetchMissingBundles();
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

    useEffect(() => {
        const removedBundleIds = members
            .filter(member => member.removed && !removingBundles.current.has(member.bundleId))
            .map(member => member.bundleId);

        if (removedBundleIds.length === 0) return;

        removedBundleIds.forEach(bundleId => removingBundles.current.add(bundleId));

        const deletePhysically = async () => {
            try {
                for (const bundleId of removedBundleIds) {
                    await deleteBundlePhysically(bundleId);
                }
            } catch (error) {
                console.log('Error physically deleting removed bundles:', error);
            } finally {
                removedBundleIds.forEach(bundleId => removingBundles.current.delete(bundleId));
            }
        };

        deletePhysically();
    }, [members, user?.userId]);

    return (
        <WordsBundleContext.Provider
            value={{
                bundles: enrichedBundles,
                createBundle,
                deleteBundlePhysically,
                editBundle,
                editBundleMember,
                generateInvitationCode,
                joinWithCode,
                langBundles,
                loading,
                members,
                removeBundle,
                setWordsBackfilled,
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
