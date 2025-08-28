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
  updateLocalItems
} from "../utils/sync";
import { useAppInitializer } from "./AppInitializerContext";

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

const SuggestionsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { initialLoad } = useAppInitializer();
  const { getAllSuggestions, deleteSuggestions, saveSuggestions } = useSuggestionsRepository();
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialLoad.suggestions);
  const [loading, setLoading] = useState(true);
  const languageContext = useLanguage();
  const langSuggestions = suggestions.filter((suggestion) => suggestion.mainLang == languageContext.mainLang &&
    suggestion.translationLang == languageContext.translationLang && !suggestion.skipped).sort((a, b) => a.displayCount - b.displayCount);

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
      const unsyncedSuggestions = getUnsyncedItems<Suggestion>(suggestionsList);
      const serverUpdates = await syncInBatches<Suggestion>(unsyncedSuggestions, syncSuggestionsOnServer);

      if (!serverUpdates) return;

      const updatedLocalSuggestions = updateLocalItems<Suggestion>(suggestionsList, serverUpdates);
      const serverSuggestions = await fetchNewSuggestions(updatedLocalSuggestions);
      const mergedSuggestions = mergeLocalAndServer<Suggestion>(updatedLocalSuggestions, serverSuggestions);
      const locallyKeptSuggestions = mergedSuggestions.filter(suggestion => !suggestion.synced || !suggestion.skipped);
      const suggestionsToRemove = mergedSuggestions.filter(suggestion => suggestion.synced && suggestion.skipped);

      const changedSuggestions = findChangedItems<Suggestion>(suggestionsList, mergedSuggestions);

      if (changedSuggestions.length > 0) {
        await deleteSuggestions(suggestionsToRemove.map(e => e.id));
        await saveSuggestions(changedSuggestions);
        setSuggestions(locallyKeptSuggestions);
      }
    } catch (error) {
      console.log("Error syncing evaluations:", error);
    }
  };

  const fetchNewSuggestions = async (updatedSuggestions: Suggestion[]): Promise<Suggestion[]> => {
    const latestUpdatedAt = findLatestUpdatedAt<Suggestion>(updatedSuggestions);
    return await fetchUpdatedSuggestions(languageContext.mainLang, languageContext.translationLang, latestUpdatedAt);
  };

  const loadSuggestions = async () => {
    try {
      await syncSuggestions(initialLoad.suggestions);
    } catch (error) {
      console.log('Error loading words from storage:', error);
    }
  }

  const loadData = async () => {
    try {
      setLoading(true);
      await loadSuggestions();
    } catch (error) {
      console.log('Error loading evaluations from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [languageContext.translationLang, languageContext.mainLang]);

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