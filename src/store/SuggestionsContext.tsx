import React, { createContext, FC, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useSuggestionsRepository } from "../hooks/repo/useSuggestionsRepository";
import { fetchUpdatedSuggestions, syncSuggestionsOnServer } from "../api/apiClient";
import debounce from "lodash.debounce";
import { Suggestion } from "../types";
import { useLanguage } from "./LanguageContext";
import {
  findChangedItems,
  findLatestUpdatedAt,
  getUnsyncedItems,
  mergeLocalAndServer,
  syncInBatches,
  updateLocalItems,
} from "../utils/sync";
import { useAppInitializer } from "./AppInitializerContext";
import { useAuth } from "../api/auth/AuthProvider";

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
  const [loading, setLoading] = useState(false);
  const { translationLang, mainLang } = useLanguage();
  const { user } = useAuth();
  const langSuggestions = suggestions.filter((suggestion) => suggestion.mainLang == mainLang &&
    suggestion.translationLang == translationLang && !suggestion.skipped && !suggestion.added)
    .sort((a, b) => a.displayCount - b.displayCount);
  const syncedOnMount = useRef(false);
  const syncing = useRef(false);

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
      const updatedSuggestions = updated.filter(suggestion => ids.includes(suggestion.id));
      saveSuggestions(updatedSuggestions);
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
      const updatedSuggestions = updated.filter(suggestion => ids.includes(suggestion.id));
      saveSuggestions(updatedSuggestions);
      return updated;
    });
  };

  const syncSuggestions = async (inputSuggestions?: Suggestion[]) => {
    try {
      if (syncing.current) return;
      syncing.current = true;
      let suggestionsList = inputSuggestions ?? (await getAllSuggestions());
      const langSuggestionsList = suggestionsList.filter((suggestion) => suggestion.mainLang ==
        mainLang && suggestion.translationLang == translationLang);
      const unsyncedSuggestions = getUnsyncedItems<Suggestion>(langSuggestionsList);
      const serverUpdates = await syncInBatches<Suggestion>(unsyncedSuggestions, syncSuggestionsOnServer);

      const updatedSuggestions = updateLocalItems<Suggestion>(langSuggestionsList, serverUpdates);
      const serverSuggestions = await fetchNewSuggestions(updatedSuggestions);
      suggestionsList = inputSuggestions ?? (await getAllSuggestions());
      const mergedSuggestions = mergeLocalAndServer<Suggestion>(suggestionsList, serverSuggestions);

      const locallyKeptSuggestions = mergedSuggestions.filter(suggestion => !suggestion.synced || (!suggestion.skipped && !suggestion.added));
      const suggestionsToRemove = mergedSuggestions.filter(suggestion => suggestion.synced && (suggestion.skipped || suggestion.added));
      const changedSuggestions = findChangedItems<Suggestion>(suggestionsList, mergedSuggestions);

      if (changedSuggestions.length > 0) {
        setSuggestions(locallyKeptSuggestions);
        await deleteSuggestions(suggestionsToRemove.map(e => e.id));
        await saveSuggestions(changedSuggestions);
      }
    } catch (error) {
      console.log("Error syncing suggestions:", error);
    } finally {
      syncing.current = false;
    }
  };

  const fetchNewSuggestions = async (updatedSuggestions: Suggestion[]): Promise<Suggestion[]> => {
    const latestUpdatedAt = findLatestUpdatedAt<Suggestion>(updatedSuggestions);
    return await fetchUpdatedSuggestions(mainLang, translationLang, latestUpdatedAt);
  };

  const loadData = async () => {
    const userDeterminedLanguageLevel = user.languageLevels?.some((level) => level.language == mainLang);
    if (mainLang == translationLang || !userDeterminedLanguageLevel) return;

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
    if (syncing.current || (langSuggestions.length >= 20 && syncedOnMount.current)) return;
    syncedOnMount.current = true;
    loadData();
  }, [user.languageLevels, mainLang, translationLang, langSuggestions.length]);

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