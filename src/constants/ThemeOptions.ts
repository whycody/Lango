import { AppTheme } from './UserPreferences';

export const THEME_OPTIONS: { descKey: string; labelKey: string; theme: AppTheme }[] = [
    { descKey: 'theme.blue_desc', labelKey: 'theme.blue', theme: AppTheme.BLUE },
    { descKey: 'theme.green_desc', labelKey: 'theme.green', theme: AppTheme.GREEN },
    { descKey: 'theme.pink_desc', labelKey: 'theme.pink', theme: AppTheme.PINK },
    { descKey: 'theme.red_desc', labelKey: 'theme.red', theme: AppTheme.RED },
    { descKey: 'theme.orange_desc', labelKey: 'theme.orange', theme: AppTheme.ORANGE },
    { descKey: 'theme.purple_desc', labelKey: 'theme.purple', theme: AppTheme.PURPLE },
];
