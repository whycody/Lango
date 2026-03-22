import { SessionModel, SessionModelVersion, WordSet, WordSetStrategy } from '../../types';
import { mapWordsToSessionWords } from '../../utils/sessionWordMapper';

export const randomStrategy: WordSetStrategy = (size, words): WordSet => {
    const active = words.filter(w => w.active);
    const shuffled = mapWordsToSessionWords([...active].sort(() => Math.random() - 0.5));
    return {
        model: SessionModel.NONE,
        sessionWords: shuffled.slice(0, size),
        version: SessionModelVersion.R1,
    };
};
