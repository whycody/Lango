import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';

import { runMigrations } from '../database/migrations/migrations';
import { useBundleMemberRepository } from '../hooks/repo/useBundleMemberRepository';
import { useEvaluationsRepository } from '../hooks/repo/useEvaluationsRepository';
import { useSessionsRepository } from '../hooks/repo/useSessionsRepository';
import { useSuggestionsRepository } from '../hooks/repo/useSuggestionsRepository';
import { useWordsBundleRepository } from '../hooks/repo/useWordsBundleRepository';
import { useWordsHeuristicStatesRepository } from '../hooks/repo/useWordsHeuristicStatesRepository';
import { useWordsMLStatesRepository } from '../hooks/repo/useWordsMLStatesRepository';
import { useWordsRepository } from '../hooks/repo/useWordsRepository';
import { InitialLoad } from '../types';
import { useAuth } from './AuthContext';

interface AppInitializerContextProps {
    initialLoad: InitialLoad | null;
    loading: boolean;
}

export const AppInitializerContext = createContext<AppInitializerContextProps>({
    initialLoad: null,
    loading: true,
});

export const MAIN_LANG = 'mainLangCode';
export const TRANSLATION_LANG = 'translationLangCode';

export const AppInitializerProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { createTables: createSessionsTables, getAllSessions } = useSessionsRepository();
    const { createTables: createWordsTables, getAllWords } = useWordsRepository();
    const { createTables: createEvaluationsTables, getAllEvaluations } = useEvaluationsRepository();
    const { createTables: createSuggestionsTables, getAllSuggestions } = useSuggestionsRepository();
    const { createTables: createWordsMLStatesTables, getAllWordsStates: getAllWordsMLStates } =
        useWordsMLStatesRepository();
    const {
        createTables: createWordsHeuristicStatesTables,
        getAllWordsStates: getAllWordsHeuristicStates,
    } = useWordsHeuristicStatesRepository();
    const { createTables: createWordsBundlesTables, getAllWordsBundles } =
        useWordsBundleRepository();
    const { createTables: createBundleMembersTables, getAllBundleMembers } =
        useBundleMemberRepository();

    const [initialLoad, setInitialLoad] = useState<InitialLoad | null>(null);
    const [loading, setLoading] = useState(true);

    const init = async () => {
        try {
            await Promise.all([
                createSessionsTables(),
                createWordsTables(),
                createEvaluationsTables(),
                createSuggestionsTables(),
                createWordsMLStatesTables(),
                createWordsHeuristicStatesTables(),
                createWordsBundlesTables(),
                createBundleMembersTables(),
            ]);

            await runMigrations(user!.userId);

            const [
                sessions,
                words,
                evaluations,
                suggestions,
                wordsMLStates,
                wordsHeuristicStates,
                wordsBundles,
                bundleMembers,
            ] = await Promise.all([
                getAllSessions(),
                getAllWords(),
                getAllEvaluations(),
                getAllSuggestions(),
                getAllWordsMLStates(),
                getAllWordsHeuristicStates(),
                getAllWordsBundles(),
                getAllBundleMembers(),
            ]);

            setInitialLoad({
                bundleMembers,
                evaluations,
                sessions,
                suggestions,
                words,
                wordsBundles,
                wordsHeuristicStates,
                wordsMLStates,
            });
        } catch (e) {
            console.error('AppInitializer init failed', e);
        }
    };
    useEffect(() => {
        setLoading(!initialLoad);
    }, [initialLoad]);

    useEffect(() => {
        if (!user?.userId) {
            setInitialLoad(null);
        } else {
            init();
        }
    }, [user?.userId]);

    return (
        <AppInitializerContext.Provider value={{ initialLoad, loading }}>
            {children}
        </AppInitializerContext.Provider>
    );
};

export const useAppInitializer = () => {
    const context = useContext(AppInitializerContext);
    if (!context) {
        throw new Error('useAppInitializer must be used within AppInitializerProvider');
    }
    return context;
};
