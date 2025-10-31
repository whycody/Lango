import React, { createContext, FC, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Evaluation, Word, WordHeuristicState } from './types';
import { useWords } from "./WordsContext";
import { useWordsHeuristicStatesRepository } from "../hooks/repo/useWordsHeuristicStatesRepository";
import { useEvaluations } from "./EvaluationsContext";
import { useAppInitializer } from "./AppInitializerContext";

interface WordsHeuristicContextProps {
  loading: boolean;
  wordsHeuristicStates: WordHeuristicState[];
  langWordsHeuristicStates: WordHeuristicState[];
}

const WordsHeuristicContext = createContext<WordsHeuristicContextProps>({
  loading: false,
  wordsHeuristicStates: [],
  langWordsHeuristicStates: [],
});

type WordToSync = {
  word: Word
  relatedEvals: Evaluation[]
}

export const WordsHeuristicProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { initialLoad } = useAppInitializer();
    const [wordsHeuristicStates, setWordsHeuristicStates] = useState<WordHeuristicState[]>(initialLoad.wordsHeuristicStates);
    const wordsHeuristicStatesRef = useRef<WordHeuristicState[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const { update: updateWordHeuristicState } = useWordsHeuristicStatesRepository();

    const { evaluations } = useEvaluations();
    const { words, langWords } = useWords();

    const langWordsIdsSet = useMemo(() => new Set(langWords.map(l => l.id)), [langWords]);
    const langWordsHeuristicStates = useMemo(() => wordsHeuristicStates?.filter((wordDetail: WordHeuristicState) =>
        langWordsIdsSet.has(wordDetail.wordId)) || [], [wordsHeuristicStates, langWordsIdsSet]);

    useEffect(() => {
      if (!words || !initialized || !evaluations) return;
      const toSync = getWordsToSync(words, evaluations, wordsHeuristicStatesRef.current);
      setLoading(true);
      syncWordsBatch(toSync);
    }, [words?.length, evaluations?.length, initialized])

    useEffect(() => {
      if (wordsHeuristicStates !== null) {
        wordsHeuristicStatesRef.current = wordsHeuristicStates;
        setInitialized(true);
      }
    }, [wordsHeuristicStates]);

    const getInitialState = (wordId: string): WordHeuristicState => ({
      wordId,
      interval: 1,
      repetitionsCount: 0,
      studyCount: 0,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      EF: 2.5,
    });

    const getWordsToSync = (words: Word[], evaluations: Evaluation[], currentStates: WordHeuristicState[]): WordToSync[] => {
      const statesMap = new Map(currentStates.map(s => [s.wordId, s]));
      const evalsMap = new Map<string, Evaluation[]>();

      for (const e of evaluations) {
        if (!evalsMap.has(e.wordId)) evalsMap.set(e.wordId, []);
        evalsMap.get(e.wordId)!.push(e);
      }

      const toSync: WordToSync[] = [];
      for (const word of words) {
        const existing = statesMap.get(word.id);
        const relatedEvals = evalsMap.get(word.id) || [];

        if (!existing || existing.repetitionsCount !== relatedEvals.length) {
          toSync.push({ word, relatedEvals });
        }
      }

      return toSync;
    }

    const syncWordsBatch = async (toSync: WordToSync[]): Promise<void> => {
      if (!toSync || toSync.length === 0) return;

      const updates: WordHeuristicState[] = toSync.map(({ word, relatedEvals }) =>
        computeCurrentHeuristicState(word.id, relatedEvals)
      );

      await Promise.all(updates.map(updateWordHeuristicState));

      setWordsHeuristicStates(prev => {
        const updatedMap = new Map(prev.map(s => [s.wordId, s]));
        for (const state of updates) updatedMap.set(state.wordId, state);
        return Array.from(updatedMap.values());
      });

      setLoading(false);
    }

    const computeCurrentHeuristicState = (wordId: string, relatedEvals: Evaluation[]): WordHeuristicState => {
      let initialState = getInitialState(wordId);

      relatedEvals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach((evaluation) => {
        initialState = updateHeuristicState(initialState, evaluation);
      });

      return initialState;
    }

    const updateHeuristicState = (heuristicState: WordHeuristicState, evaluation: Evaluation): WordHeuristicState => {
      let { interval, EF, repetitionsCount, studyCount } = heuristicState;
      const grade = evaluation.grade;
      repetitionsCount += 1;

      if (grade === 1) {
        studyCount = 0;
        interval = 1;
      } else {
        studyCount += 1;
        if (studyCount === 1) interval = 1;
        else if (studyCount === 2) interval = 3;
        else if (studyCount === 3) interval = 6;
        else interval = Math.round(interval * EF);
      }

      EF = grade === 3
        ? Math.min(2.5, EF + 0.1)
        : Math.max(1.3, EF - (3 - grade) * (0.08 + (3 - grade) * 0.02));

      const lastReviewDate = evaluation.date;
      const nextReviewDate = new Date(new Date(evaluation.date).getTime() + interval * 24 * 60 * 60 * 1000).toISOString();

      return {
        ...heuristicState,
        EF,
        interval,
        repetitionsCount,
        studyCount,
        lastReviewDate,
        nextReviewDate,
      };
    }

    return (
      <WordsHeuristicContext.Provider
        value={{
          loading,
          wordsHeuristicStates,
          langWordsHeuristicStates
        }}
      >
        {children}
      </WordsHeuristicContext.Provider>
    );
  }
;

export const useWordsHeuristicStates = (): WordsHeuristicContextProps => {
  const context = useContext(WordsHeuristicContext);
  if (!context) throw new Error('useWordsHeuristicStates must be used within a WordsHeuristicProvider');
  return context;
};