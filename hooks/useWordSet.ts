import { useMemo } from 'react';
import { useWords, WordsSet } from "../store/WordsContext";
import { Session, SESSION_MODE, SESSION_MODEL, Word } from "../store/types";
import { useWordDetails } from "../store/WordsDetailsContext";
import { useAuth } from "../api/auth/AuthProvider";
import { useSessions } from "../store/SessionsContext";

export const useWordSet = (size: number, mode: SESSION_MODE): WordsSet => {
  const { langWords, getWordSet } = useWords();
  const { langWordsDetails } = useWordDetails();
  const { sessions } = useSessions();
  const { user } = useAuth();

  return useMemo(() => {
    if (!langWords || !langWordsDetails) return { words: [], model: SESSION_MODEL.HEURISTIC };

    const lastSession = sessions ? sessions.filter((s: Session) => s.mode == SESSION_MODE.STUDY)
      .sort((s1, s2) => new Date(s2.date).getTime() - new Date(s1.date).getTime())[0] : null;
    const model = user.sessionModel;

    if (model == SESSION_MODEL.HEURISTIC || (lastSession && lastSession.sessionModel == SESSION_MODEL.ML &&
      model == SESSION_MODEL.HYBRID)) {
      return getWordSet(size, mode);
    }

    const sortedDetails = [...langWordsDetails].sort((a, b) => {
      if (mode === SESSION_MODE.RANDOM) {
        return Math.random() - 0.5;
      }
      if (mode === SESSION_MODE.STUDY) {
        return a.gradeThreeProb - b.gradeThreeProb;
      }
      if (mode === SESSION_MODE.OLDEST) {
        return b.hoursSinceLastRepetition - a.hoursSinceLastRepetition;
      }
      return 0;
    });

    const sliced = sortedDetails.slice(0, size)
    const ids = sliced.map(wd => wd.wordId);
    const idToWordMap = new Map(langWords.map(w => [w.id, w]));

    const result: Word[] = ids
      .map(id => idToWordMap.get(id))
      .filter((w): w is Word => w !== undefined);

    return { words: result.sort(() => Math.random() - 0.5), model: SESSION_MODEL.ML };
  }, [user.sessionModel, langWords, langWordsDetails, size, mode]);
};
