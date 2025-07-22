import React, { createContext, FC, useContext, useEffect, useRef, useState } from "react";
import { useEvaluations } from "./EvaluationsContext";
import { useWords } from "./WordsContext";
import { useWordsDetailsRepository } from "../hooks/useWordsDetailsRepository";
import { score } from "../utils/model";
import { Word, WordDetails, Evaluation } from "./types";

interface WordDetailsContextProps {
  loading: boolean;
  wordsDetails: WordDetails[] | null;
}

export const WordsDetailsContext = createContext<WordDetailsContextProps>({
  loading: false,
  wordsDetails: [],
})

export const WordsDetailsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wordsDetails, setWordsDetails] = useState<WordDetails[] | null>(null);
  const wordsDetailsRef = useRef<WordDetails[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState(false);
  const { createTables, getAllWordsDetails, updateWordDetails, saveWordsDetails } = useWordsDetailsRepository();
  const { evaluations } = useEvaluations();
  const { words } = useWords();

  useEffect(() => {
    if (!words || !initialized || !evaluations) return;
    words.forEach((word: Word) => syncWithWordDetails(word.id));
  }, [words, evaluations, initialized]);

  useEffect(() => {
    if (wordsDetails !== null) {
      wordsDetailsRef.current = wordsDetails;
      setInitialized(true);
    }
  }, [wordsDetails]);

  const calculateGradesTrend = (grades: number[]): number => {
    if (grades.length < 2) return 0;
    let diffs = [];
    for (let i = 1; i < grades.length; i++) {
      diffs.push(grades[i] - grades[i - 1]);
    }
    const sum = diffs.reduce((a, b) => a + b, 0);
    return sum / diffs.length;
  };

  const syncWithWordDetails = async (wordId: string) => {
    const currentWordsDetails = wordsDetailsRef.current;
    if (!currentWordsDetails) return;

    const existingDetails = currentWordsDetails.find(d => d.wordId === wordId);
    const relatedEvals = evaluations.filter(e => e.wordId === wordId);

    if (!existingDetails || existingDetails.repetitionsCount !== relatedEvals.length) {
      const word = words?.find(w => w.id === wordId);
      if (!word) return;

      const details = computeWordDetails(word, relatedEvals);

      const lastEvalDate = relatedEvals.length
        ? new Date(
          relatedEvals.reduce((latest, e) =>
            new Date(e.date) > new Date(latest.date) ? e : latest
          ).date
        )
        : new Date(word.addDate);

      const diffHours = (Date.now() - lastEvalDate.getTime()) / (1000 * 60 * 60);

      const input = [
        diffHours,
        details.studyDuration,
        details.gradesAverage,
        details.repetitionsCount,
        details.gradesTrend,
      ];

      const [p1, p2, p3] = score(input);
      const predictedGrade = ([p1, p2, p3].indexOf(Math.max(p1, p2, p3)) + 1) as 1 | 2 | 3;

      const updated: WordDetails = {
        ...details,
        hoursSinceLastRepetition: diffHours,
        predictedGrade,
        gradeThreeProb: p3,
      };

      await updateWordDetails(updated);

      setWordsDetails(prev =>
        prev
          ? prev.map(d => (d.wordId === wordId ? updated : d)).concat(
            prev.find(d => d.wordId === wordId) ? [] : [updated]
          )
          : [updated]
      );
    }
  };

  const computeWordDetails = (word: Word, evaluations: Evaluation[]): WordDetails => {
    const sorted = evaluations
      .filter(e => e.wordId === word.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const grades = sorted.map(e => e.grade);
    const dates = sorted.map(e => new Date(e.date));
    const repetitionsCount = grades.length;

    const last5 = grades.slice(-5);
    const gradesAverage = last5.length > 0 ? last5.reduce((a, b) => a + b, 0) / last5.length : 0;
    const gradesTrend = last5.length > 1 ? calculateGradesTrend(last5) : 0;

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
        } else if (g === 1 || g === 2) {
          currentSeriesType = 'unlearned';
          studyDuration = 1;
        } else {
          break;
        }
        startTime = d;
      } else {
        if (currentSeriesType === 'learned' && g === 3) {
          studyDuration += 1;
          startTime = d;
        } else if (currentSeriesType === 'unlearned' && (g === 1 || g === 2)) {
          studyDuration += 1;
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
      studyDuration: durationHours,
      gradesAverage,
      repetitionsCount,
      gradesTrend,
      predictedGrade: 1,
      gradeThreeProb: 0,
    };
  };

  const syncHoursSinceLastRepetition = async (wordDetails: WordDetails[]) => {
    const now = new Date().getTime();

    const updatedDetails: WordDetails[] = [];

    for (const wordDetail of wordDetails) {
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
          wordDetail.gradesTrend,
        ];

        const [p1, p2, p3] = score(input);
        const maxIndex = [p1, p2, p3].indexOf(Math.max(p1, p2, p3));
        const predictedGrade = (maxIndex + 1) as 1 | 2 | 3;

        updatedDetails.push({
          ...wordDetail,
          hoursSinceLastRepetition: diffHours,
          predictedGrade,
          gradeThreeProb: p3,
        });
      }
    }

    if (updatedDetails.length > 0) {
      await saveWordsDetails(updatedDetails);
      setWordsDetails(prev =>
        prev
          ? prev.map(detail => {
            const updated = updatedDetails.find(u => u.wordId === detail.wordId);
            return updated ? updated : detail;
          })
          : updatedDetails
      );
    }
  };

  const loadWordsDetails = async () => {
    const wordsDetails = await getAllWordsDetails();
    setWordsDetails(wordsDetails);
    await syncHoursSinceLastRepetition(wordsDetails);
  }

  const loadData = async () => {
    try {
      setLoading(true);
      await createTables();
      await loadWordsDetails();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <WordsDetailsContext.Provider value={{ loading, wordsDetails }}>
      {children}
    </WordsDetailsContext.Provider>
  );
}

export const useWordDetails = (): WordDetailsContextProps => {
  const context = useContext(WordsDetailsContext);
  if (!context) {
    throw new Error("useWords must be used within a WordsProvider");
  }
  return context;
};