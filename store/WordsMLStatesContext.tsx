import React, { createContext, FC, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useEvaluations } from "./EvaluationsContext";
import { useWords } from "./WordsContext";
import { useWordsMLStatesRepository } from "../hooks/repo/useWordsMLStatesRepository";
import { score } from "../utils/model";
import { Evaluation, Word, WordMLState } from "./types";
import { useAppInitializer } from "./AppInitializerContext";

interface WordsMLStatesContextProps {
  loading: boolean;
  wordsMLStates: WordMLState[] | null;
  langWordsMLStates: WordMLState[] | null;
}

export const WordsMLStatesContext = createContext<WordsMLStatesContextProps>({
  loading: false,
  wordsMLStates: [],
  langWordsMLStates: []
})

const WordsMLStatesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { initialLoad } = useAppInitializer();
  const [wordsMLStates, setWordsMLStates] = useState<WordMLState[] | null>(initialLoad.wordsMLStates);
  const wordsMLStatesRef = useRef<WordMLState[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState(false);

  const {
    update: updateWordMLState,
    save: saveWordsMLStates
  } = useWordsMLStatesRepository();

  const { evaluations } = useEvaluations();
  const { words, langWords } = useWords();
  const langWordsIdsSet = useMemo(() => new Set(langWords.map(l => l.id)), [langWords]);
  const langWordsMLStates = useMemo(() => wordsMLStates?.filter(wordDetail => langWordsIdsSet.has(wordDetail.wordId)) || [],
    [wordsMLStates, langWordsIdsSet]);

  const evalsByWordId = useMemo(() => {
    if (!evaluations?.length) return new Map<string, Evaluation[]>();
    const map = new Map<string, Evaluation[]>();
    for (const e of evaluations) {
      const list = map.get(e.wordId);
      if (list) list.push(e);
      else map.set(e.wordId, [e]);
    }
    return map;
  }, [evaluations]);

  useEffect(() => {
    if (!words?.length || !evaluations?.length || !initialized) return;
    const wordsToSync = getWordsToSync(words, wordsMLStatesRef.current || [], evalsByWordId);
    syncWordsBatch(wordsToSync, evalsByWordId);
  }, [words, evaluations, initialized, evalsByWordId]);

  const getWordsToSync = (
    words: Word[],
    wordsMLStates: WordMLState[],
    evalsByWordId: Map<string, Evaluation[]>
  ): Word[] => {
    const mlStateByWordId = new Map(wordsMLStates.map(s => [s.wordId, s]));
    const toSync: Word[] = [];

    for (const word of words) {
      const existing = mlStateByWordId.get(word.id);
      const relatedEvals = evalsByWordId.get(word.id) || [];
      if (!existing || existing.repetitionsCount !== relatedEvals.length) {
        toSync.push(word);
      }
    }

    return toSync;
  };

  useEffect(() => {
    if (wordsMLStates !== null) {
      wordsMLStatesRef.current = wordsMLStates;
      setInitialized(true);
    }
  }, [wordsMLStates]);

  const calculateGradesTrend = (grades: number[]): number => {
    if (grades.length < 2) return 0;
    let diffs = [];
    for (let i = 1; i < grades.length; i++) {
      diffs.push(grades[i] - grades[i - 1]);
    }
    const sum = diffs.reduce((a, b) => a + b, 0);
    return sum / diffs.length;
  };

  const syncWordsBatch = async (wordsToSync: Word[], evalsByWordId: Map<string, Evaluation[]>) => {
    const updatedStates: WordMLState[] = [];

    for (const word of wordsToSync) {
      const relatedEvals = evalsByWordId.get(word.id) || [];
      const state = computeWordMLState(word, relatedEvals);

      const lastEvalDate = relatedEvals.length
        ? new Date(
          relatedEvals.reduce((latest, e) =>
            new Date(e.date) > new Date(latest.date) ? e : latest
          ).date
        )
        : new Date(word.addDate);

      const diffHours = (Date.now() - lastEvalDate.getTime()) / 36e5;

      const input = [
        diffHours,
        state.studyDuration,
        state.gradesAverage,
        state.repetitionsCount,
        state.studyStreak,
        state.gradesTrend,
      ];

      const [p1, p2, p3] = score(input);
      const predictedGrade = ([p1, p2, p3].indexOf(Math.max(p1, p2, p3)) + 1) as 1 | 2 | 3;

      const updated: WordMLState = {
        ...state,
        hoursSinceLastRepetition: diffHours,
        predictedGrade,
        gradeThreeProb: p3,
      };

      await updateWordMLState(updated);
      updatedStates.push(updated);
    }

    setWordsMLStates(prev => {
      const map = new Map(prev?.map(s => [s.wordId, s]));
      for (const u of updatedStates) map.set(u.wordId, u);
      return Array.from(map.values());
    });
  };

  const computeWordMLState = (word: Word, evaluations: Evaluation[]): WordMLState => {
    const sorted = evaluations
      .filter(e => e.wordId === word.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const grades = sorted.map(e => e.grade);
    const dates = sorted.map(e => new Date(e.date));
    const repetitionsCount = grades.length;

    const last5 = grades.slice(-5);
    const gradesAverage = last5.length > 0 ? last5.reduce((a, b) => a + b, 0) / last5.length : 0;
    const gradesTrend = last5.length > 1 ? calculateGradesTrend(last5) : 0;

    let studyStreak = 0;
    let studyDuration = 0;
    let startTime: Date | null = null;
    let endTime: Date | null = null;
    let currentSeriesType: 'learned' | 'unlearned' | null = null;

    for (let i = grades.length - 1; i >= 0; i--) {
      const g = grades[i];
      const d = dates[i];

      if (i === grades.length - 1) {
        endTime = d;
        if (g === 3) {
          currentSeriesType = 'learned';
          studyDuration = 1;
          studyStreak = 1;
        } else if (g === 1 || g === 2) {
          currentSeriesType = 'unlearned';
          studyDuration = 1;
          studyStreak = -1;
        } else {
          break;
        }
        startTime = d;
      } else {
        if (currentSeriesType === 'learned' && g === 3) {
          studyDuration += 1;
          studyStreak += 1;
          startTime = d;
        } else if (currentSeriesType === 'unlearned' && (g === 1 || g === 2)) {
          studyDuration += 1;
          studyStreak -= 1;
          startTime = d;
        } else {
          break;
        }
      }
    }

    let durationHours = 0;
    if (studyDuration > 1 && startTime && endTime) {
      durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      if (currentSeriesType === 'unlearned') durationHours *= -1;
    }

    return {
      wordId: word.id,
      hoursSinceLastRepetition: 0,
      studyStreak: studyStreak,
      studyDuration: durationHours,
      gradesAverage,
      repetitionsCount,
      gradesTrend,
      predictedGrade: 1,
      gradeThreeProb: 0,
    };
  };

  const syncHoursSinceLastRepetition = async (wordMLState: WordMLState[]) => {
    const now = new Date().getTime();

    const updatedStates: WordMLState[] = [];

    for (const wordDetail of wordMLState) {
      const wordId = wordDetail.wordId;
      const matchingEvaluations = evaluations.filter(e => e.wordId === wordId);

      let lastRelevantDate: Date | null = null;

      if (matchingEvaluations.length > 0) {
        const latestEvaluation = matchingEvaluations.reduce((latest, current) => {
          return new Date(current.date) > new Date(latest.date) ? current : latest;
        });
        lastRelevantDate = new Date(latestEvaluation.date);
      } else {
        const word = words?.find(w => w.id === wordId);
        if (word) {
          lastRelevantDate = new Date(word.addDate);
        }
      }

      if (lastRelevantDate) {
        const diffMs = now - lastRelevantDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        const input = [
          diffHours,
          wordDetail.studyDuration,
          wordDetail.gradesAverage,
          wordDetail.repetitionsCount,
          wordDetail.studyStreak,
          wordDetail.gradesTrend,
        ];

        const [p1, p2, p3] = score(input);
        const maxIndex = [p1, p2, p3].indexOf(Math.max(p1, p2, p3));
        const predictedGrade = (maxIndex + 1) as 1 | 2 | 3;

        updatedStates.push({
          ...wordDetail,
          hoursSinceLastRepetition: diffHours,
          predictedGrade,
          gradeThreeProb: p3,
        });
      }
    }

    if (updatedStates.length > 0) {
      await saveWordsMLStates(updatedStates);
      setWordsMLStates(prev =>
        prev
          ? prev.map(detail => {
            const updated = updatedStates.find(u => u.wordId === detail.wordId);
            return updated ? updated : detail;
          })
          : updatedStates
      );
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await syncHoursSinceLastRepetition(initialLoad.wordsMLStates);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <WordsMLStatesContext.Provider value={{ loading, wordsMLStates, langWordsMLStates }}>
      {children}
    </WordsMLStatesContext.Provider>
  );
}

export const useWordsMLStatesContext = (): WordsMLStatesContextProps => {
  const context = useContext(WordsMLStatesContext);
  if (!context) {
    throw new Error("useWordsMLStatesContext must be used within a WordsMLStatesProvider");
  }
  return context;
};

export default WordsMLStatesProvider;