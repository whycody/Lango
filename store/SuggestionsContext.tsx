import React, { createContext, FC, useContext, useEffect, useRef, useState } from 'react';
import { useSuggestionsRepository } from "../hooks/repo/useSuggestionsRepository";
import { fetchUpdatedSuggestions, syncSuggestionsOnServer } from "../api/apiClient";
import debounce from "lodash.debounce";
import { Suggestion } from "./types";
import { useLanguage } from "./LanguageContext";

interface SuggestionsContextProps {
  suggestions: Suggestion[];
  langSuggestions: Suggestion[];
  loading: boolean;
  increaseSuggestionsDisplayCount: (ids: string[]) => Promise<void>;
  skipSuggestions: (ids: string[]) => Promise<void>;
  syncSuggestions: () => Promise<void>;
}

export const SuggestionsContext = createContext<SuggestionsContextProps>({
  suggestions: [],
  langSuggestions: [],
  loading: true,
  increaseSuggestionsDisplayCount: () => Promise.resolve(),
  skipSuggestions: () => Promise.resolve(),
  syncSuggestions: () => Promise.resolve(),
});

const SuggestionsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAllSuggestions, deleteSuggestions, saveSuggestions, createTables } = useSuggestionsRepository();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const languageContext = useLanguage();
  const langSuggestions = suggestions.filter((suggestion) => suggestion.firstLang == languageContext.studyingLangCode &&
    suggestion.secondLang == languageContext.mainLangCode && !suggestion.skipped).sort((a, b) => a.displayCount - b.displayCount);

  const increaseSuggestionsDisplayCount = async (ids: string[]) => {
    setSuggestions(prevSuggestions => {
      const updated = prevSuggestions.map(suggestion => {
        if (ids.includes(suggestion.id)) {
          return {
            ...suggestion,
            synced: false,
            displayCount: suggestion.displayCount + 1,
            locallyUpdatedAt: new Date().toISOString()
          };
        }
        return suggestion;
      });
      saveSuggestions(updated);
      return updated;
    });
  };

  const skipSuggestions = async (ids: string[]) => {
    setSuggestions(prevSuggestions => {
      const updated = prevSuggestions.map(suggestion => {
        if (ids.includes(suggestion.id)) {
          return {
            ...suggestion,
            synced: false,
            skipped: true,
            locallyUpdatedAt: new Date().toISOString()
          };
        }
        return suggestion;
      });
      saveSuggestions(updated);
      return updated;
    });
  };

  const syncSuggestions = async (inputSuggestions?: Suggestion[]) => {
    try {
      const suggestionsList = inputSuggestions ?? (await getAllSuggestions());
      const unsyncedSuggestions = getUnsyncedSuggestions(suggestionsList);
      const serverUpdates = await syncUnsyncedSuggestions(unsyncedSuggestions);

      if (!serverUpdates) return;

      const updatedLocalSuggestions = updateLocalSuggestions(suggestionsList, new Map(serverUpdates.map(update => [update.id, update.updatedAt])));
      const serverSuggestions = await fetchNewSuggestions(updatedLocalSuggestions);
      const mergedSuggestions = mergeLocalAndServerSuggestions(updatedLocalSuggestions, serverSuggestions);
      const locallyKeptSuggestions = mergedSuggestions.filter(suggestion => !suggestion.synced || !suggestion.skipped);
      const suggestionsToRemove = mergedSuggestions.filter(suggestion => suggestion.synced && suggestion.skipped);

      const changedSuggestions = findChangedSuggestions(suggestionsList, mergedSuggestions);

      if (changedSuggestions.length > 0) {
        await deleteSuggestions(suggestionsToRemove.map(e => e.id));
        await saveSuggestions(changedSuggestions);
        setSuggestions(locallyKeptSuggestions);
      }
    } catch (error) {
      console.log("Error syncing evaluations:", error);
    }
  };

  const getUnsyncedSuggestions = (suggestions: Suggestion[]): Suggestion[] => {
    return suggestions.filter(suggestion => !suggestion.synced);
  };

  const syncUnsyncedSuggestions = async (unsyncedSuggestions: Suggestion[]): Promise<{
    id: string,
    updatedAt: string
  }[]> => {
    if (unsyncedSuggestions.length === 0) return [];
    const result = await syncSuggestionsOnServer(unsyncedSuggestions) as { id: string, updatedAt: string }[] | null;
    return result ?? [];
  };

  const findLatestUpdatedAt = (suggestions: Suggestion[]): string => {
    return new Date(
      Math.max(...suggestions.map(suggestion => new Date(suggestion.updatedAt || suggestion.locallyUpdatedAt).getTime()), 0)
    ).toISOString();
  };

  const fetchNewSuggestions = async (updatedSuggestions: Suggestion[]): Promise<Suggestion[]> => {
    const latestUpdatedAt = findLatestUpdatedAt(updatedSuggestions);
    return await fetchUpdatedSuggestions(languageContext.studyingLangCode, languageContext.mainLangCode, latestUpdatedAt);
  };

  const mergeLocalAndServerSuggestions = (localSuggestions: Suggestion[], serverSuggestions: Suggestion[]): Suggestion[] => {
    const serverSuggestionsMap = new Map(serverSuggestions.map(sw => [sw.id, sw]));
    const existingIds = new Set(localSuggestions.map(w => w.id));

    const mergedSuggestions = localSuggestions.map(word => {
      if (serverSuggestionsMap.has(word.id)) {
        const serverSuggestion = serverSuggestionsMap.get(word.id)!;
        return {
          ...serverSuggestion,
          synced: true,
          locallyUpdatedAt: serverSuggestion.updatedAt,
          updatedAt: serverSuggestion.updatedAt,
        };
      }
      return word;
    });

    const newSuggestions = serverSuggestions.filter(sw => !existingIds.has(sw.id)).map(sw => ({
      ...sw,
      synced: true,
      locallyUpdatedAt: sw.updatedAt,
      updatedAt: sw.updatedAt,
    }));

    return [...mergedSuggestions, ...newSuggestions];
  };

  const findChangedSuggestions = (originalSuggestions: Suggestion[], finalSuggestions: Suggestion[]): Suggestion[] => {
    const originalMap = new Map(originalSuggestions.map(suggestion => [suggestion.id, suggestion]));

    return finalSuggestions.filter(suggestion => {
      const original = originalMap.get(suggestion.id);
      if (!original) return true;
      return (
        original.synced !== suggestion.synced ||
        original.updatedAt !== suggestion.updatedAt ||
        original.locallyUpdatedAt !== suggestion.locallyUpdatedAt
      );
    });
  };

  const updateLocalSuggestions = (suggestions: Suggestion[], updatesMap: Map<string, string>): Suggestion[] => {
    return suggestions.map(suggestion => {
      if (updatesMap.has(suggestion.id)) {
        return {
          ...suggestion,
          synced: true,
          updatedAt: updatesMap.get(suggestion.id) as string,
        };
      }
      return suggestion;
    });
  };

  const loadSuggestions = async () => {
    try {
      const loadedSuggestions = await getAllSuggestions();
      setSuggestions(loadedSuggestions);
      await syncSuggestions(loadedSuggestions);
    } catch (error) {
      console.log('Error loading words from storage:', error);
    }
  }

  const loadData = async () => {
    try {
      setLoading(true);
      await createTables();
      await loadSuggestions();
    } catch (error) {
      console.log('Error loading evaluations from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [languageContext.mainLangCode, languageContext.studyingLangCode]);

  return (
    <SuggestionsContext.Provider
      value={{
        suggestions,
        langSuggestions,
        loading,
        increaseSuggestionsDisplayCount,
        skipSuggestions,
        syncSuggestions
      }}>
      {children}
    </SuggestionsContext.Provider>
  );
};

export function useDebouncedSyncSuggestions(syncFn: () => void, delay: number = 1000) {
  const syncFnRef = useRef(syncFn);
  const debouncedRef = useRef<() => void>();

  useEffect(() => {
    syncFnRef.current = syncFn;
  }, [syncFn]);

  useEffect(() => {
    debouncedRef.current = debounce(() => syncFnRef.current(), delay);
    return () => {
      debouncedRef.current?.cancel();
    };
  }, [delay]);

  return () => debouncedRef.current?.();
}

export const useSuggestions = (): SuggestionsContextProps => {
  const context = useContext(SuggestionsContext);
  if (!context) {
    throw new Error("useSuggestions must be used within an SuggestionsProvider");
  }
  return context;
};

export default SuggestionsProvider;