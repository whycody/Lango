import { LanguageLevelRange } from '../types';
import { CustomTheme } from '../ui/Theme';

export const getLanguageLevelColor = (level: LanguageLevelRange, colors: CustomTheme['colors']) => {
    switch (level) {
        case 1:
            return colors.green;
        case 2:
            return colors.yellow;
        case 3:
            return colors.orange;
        case 4:
            return colors.coral;
        default:
            return colors.red;
    }
};
