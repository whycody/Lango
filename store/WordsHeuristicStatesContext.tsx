import React, { createContext, FC, useContext, useEffect, useRef, useState } from 'react';
import { Evaluation, Word, WordHeuristicState } from './types';
import { useWords } from "./WordsContext";
import { useWordsHeuristicStatesRepository } from "../hooks/repo/useWordsHeuristicStatesRepository";
import { useEvaluations } from "./EvaluationsContext";

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

export const WordsHeuristicProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wordsHeuristicStates, setWordsHeuristicStates] = useState<WordHeuristicState[]>([]);
  const wordsHeuristicStatesRef = useRef<WordHeuristicState[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const {
    createTables,
    getAll: getAllWordsHeuristicStates,
    update: updateWordHeuristicState
  } = useWordsHeuristicStatesRepository();

  const { evaluations } = useEvaluations();
  const { words, langWords } = useWords();
  const langWordsIds = langWords.map((l) => l.id);
  const langWordsHeuristicStates = wordsHeuristicStates.filter((wordDetail: WordHeuristicState) =>
    langWordsIds.includes(wordDetail.wordId));

  useEffect(() => {
    if (!words || !initialized || !evaluations) return;
    words.forEach((word: Word) => syncWithWordHeuristicStates(word.id));
  }, [words?.length, evaluations?.length, initialized]);

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

  const syncWithWordHeuristicStates = async (wordId: string) => {
    const currentWordsHeuristicStates = wordsHeuristicStatesRef.current;
    if (!currentWordsHeuristicStates) return;

    const existingHeuristicState = currentWordsHeuristicStates.find(s => s.wordId === wordId);
    const relatedEvals = evaluations?.filter(e => e.wordId === wordId);

    if (!existingHeuristicState || existingHeuristicState.repetitionsCount !== relatedEvals.length) {
      const state = computeCurrentHeuristicState(wordId, relatedEvals);
      await updateWordHeuristicState(state);

      setWordsHeuristicStates(prev => [...prev.filter(s => s.wordId !== state.wordId), state]);
    }
  };

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

  const loadWordsHeuristicStates = async () => {
    const wordsHeuristicStates = await getAllWordsHeuristicStates();
    setWordsHeuristicStates(wordsHeuristicStates);
  }

  const loadData = async () => {
    try {
      setLoading(true);
      await createTables();
      await loadWordsHeuristicStates();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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
};

export const useWordsHeuristicStates = (): WordsHeuristicContextProps => {
  const context = useContext(WordsHeuristicContext);
  if (!context) throw new Error('useWordsHeuristicStates must be used within a WordsHeuristicProvider');
  return context;
};