import { SessionModel, SessionModelVersion } from '../../constants/Session';
import { SessionWord } from './Word';

export type WordSet = {
    model: SessionModel;
    sessionWords: SessionWord[];
    version: SessionModelVersion;
};
