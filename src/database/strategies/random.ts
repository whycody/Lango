import { SessionModel, SessionModelVersion } from '../../constants/Session';
import { WordSet, WordSetStrategy } from '../../types';
import { mapWordsToSessionWords, shuffle } from '../../utils/strategiesUtils';

export const randomStrategy: WordSetStrategy = (size, words): WordSet => {
    const active = words.filter(w => w.active);
    const shuffled = mapWordsToSessionWords(shuffle(active));
    return {
        model: SessionModel.NONE,
        sessionWords: shuffled.slice(0, size),
        version: SessionModelVersion.R1,
    };
};
