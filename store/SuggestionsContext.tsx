import React, { createContext, FC, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useSuggestionsRepository } from "../hooks/repo/useSuggestionsRepository";
import { fetchUpdatedSuggestions, syncSuggestionsOnServer } from "../api/apiClient";
import debounce from "lodash.debounce";
import { Suggestion } from "./types";
import { useLanguage } from "./LanguageContext";
import {
  findChangedItems,
  findLatestUpdatedAt,
  getUnsyncedItems,
  mergeLocalAndServer,
  syncInBatches,
} from "../utils/sync";
import { useAppInitializer } from "./AppInitializerContext";

interface SuggestionsContextProps {
  suggestions: Suggestion[];
  langSuggestions: Suggestion[];
  loading: boolean;
  increaseSuggestionsDisplayCount: (ids: string[]) => Promise<void>;
  skipSuggestions: (ids: string[], prop: 'skipped' | 'added') => Promise<void>;
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

const SuggestionsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { initialLoad } = useAppInitializer();
  const { getAllSuggestions, deleteSuggestions, saveSuggestions } = useSuggestionsRepository();
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialLoad.suggestions);
  const [loading, setLoading] = useState(true);
  const { translationLang, mainLang } = useLanguage();
  const langSuggestions = suggestions.filter((suggestion) => suggestion.mainLang == mainLang &&
    suggestion.translationLang == translationLang && !suggestion.skipped && !suggestion.added)
    .sort((a, b) => a.displayCount - b.displayCount);

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

  const skipSuggestions = async (ids: string[], prop: 'skipped' | 'added') => {
    setSuggestions(prevSuggestions => {
      const updated = prevSuggestions.map(suggestion => {
        if (ids.includes(suggestion.id)) {
          return {
            ...suggestion,
            synced: false,
            skipped: prop == 'skipped' ? true : suggestion.skipped,
            added: prop == 'added' ? true : suggestion.added,
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
      const langSuggestionsList = suggestionsList.filter((suggestion) => suggestion.mainLang ==
        mainLang && suggestion.translationLang == translationLang);
      const unsyncedSuggestions = getUnsyncedItems<Suggestion>(langSuggestionsList);
      const serverUpdates = await syncInBatches<Suggestion>(unsyncedSuggestions, syncSuggestionsOnServer);

      if (!serverUpdates) return;

      const serverSuggestions = await fetchNewSuggestions(langSuggestionsList);
      const mergedSuggestions = mergeLocalAndServer<Suggestion>(suggestionsList, serverSuggestions);
      const locallyKeptSuggestions = mergedSuggestions.filter(suggestion => !suggestion.synced || (!suggestion.skipped && !suggestion.added));
      const suggestionsToRemove = mergedSuggestions.filter(suggestion => suggestion.synced && (suggestion.skipped || suggestion.added));

      const changedSuggestions = findChangedItems<Suggestion>(suggestionsList, mergedSuggestions);

      if (changedSuggestions.length > 0) {
        await deleteSuggestions(suggestionsToRemove.map(e => e.id));
        await saveSuggestions(changedSuggestions);
        setSuggestions(locallyKeptSuggestions);
      }
    } catch (error) {
      console.log("Error syncing suggestions:", error);
    }
  };

  const fetchNewSuggestions = async (updatedSuggestions: Suggestion[]): Promise<Suggestion[]> => {
    const latestUpdatedAt = findLatestUpdatedAt<Suggestion>(updatedSuggestions);
    return await fetchUpdatedSuggestions(mainLang, translationLang, latestUpdatedAt);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await syncSuggestions();
    } catch (error) {
      console.log('Error loading suggestions from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mainLang, translationLang]);

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