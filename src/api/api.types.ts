import {
    AppConfig,
    BundleJoinCode,
    BundleMember,
    BundleSearchResponse,
    Evaluation,
    ExampleFlashcard,
    JoinBundleWithCodeResult,
    LanguageLevel,
    Session,
    Suggestion,
    SyncResultWithRejections,
    User,
    UserSummary,
    Word,
    WordsBundle,
    WordsBundleWithOwnerInfo,
} from '../types';

export type ApiErrorCode =
    | 'already-member'
    | 'forbidden'
    | 'network'
    | 'not-found'
    | 'server-error'
    | 'unauthorized'
    | 'unknown'
    | 'validation-error';

export type ApiProblem = { errorCode: ApiErrorCode; kind: 'error' };

// -----AUTH-----

export type AuthTokensResponse = {
    accessToken: string;
    refreshToken: string;
};

export type SignInWithGoogleApi = { data: AuthTokensResponse; kind: 'ok' } | ApiProblem;
export type SignInWithFacebookApi = { data: AuthTokensResponse; kind: 'ok' } | ApiProblem;
export type SignInWithAppleApi = { data: AuthTokensResponse; kind: 'ok' } | ApiProblem;
export type SignOutApi = { data: null; kind: 'ok' } | ApiProblem;
export type DeleteAccountApi = { data: null; kind: 'ok' } | ApiProblem;

// -----USERS-----

export type UpdateUserDataRequest = {
    level: LanguageLevel['level'];
    mainLang: LanguageLevel['language'];
    selectedFlashcardsIds: string[];
    skippedFlashcardsIds: string[];
    translationLang: LanguageLevel['language'];
};

export type UpdateSuggestionsInSessionRequest = { enabled: boolean };
export type UpdateFinishedOnboardingRequest = { finished: boolean };
export type UpdateNotificationsEnabledRequest = { enabled: boolean };
export type UpdateLanguageLevelsRequest = { languageLevels: LanguageLevel[] };

export type GetUserInfoApi = { data: User | null; kind: 'ok' } | ApiProblem;
export type FetchUserSummaryApi = { data: UserSummary | null; kind: 'ok' } | ApiProblem;
export type UpdateUserDataApi = { data: null; kind: 'ok' } | ApiProblem;
export type UpdateSuggestionsInSessionApi = { data: null; kind: 'ok' } | ApiProblem;
export type UpdateFinishedOnboardingApi = { data: null; kind: 'ok' } | ApiProblem;
export type UpdateNotificationsEnabledApi = { data: null; kind: 'ok' } | ApiProblem;
export type UpdateLanguageLevelsApi = { data: null; kind: 'ok' } | ApiProblem;
export type RegisterDeviceTokenApi = { data: null; kind: 'ok' } | ApiProblem;

// -----APP CONFIG-----

export type GetAppConfigApi = { data: AppConfig | null; kind: 'ok' } | ApiProblem;

// -----WORDS-----

export type SyncWordsOnServerApi =
    | { data: SyncResultWithRejections<Word>; kind: 'ok' }
    | ApiProblem;
export type FetchUpdatedWordsApi = { data: Word[]; kind: 'ok' } | ApiProblem;

// -----SESSIONS-----

export type SyncSessionsOnServerApi =
    | { data: SyncResultWithRejections<Session>; kind: 'ok' }
    | ApiProblem;
export type FetchUpdatedSessionsApi = { data: Session[]; kind: 'ok' } | ApiProblem;

// -----EVALUATIONS-----

export type SyncEvaluationsOnServerApi =
    | { data: SyncResultWithRejections<Evaluation>; kind: 'ok' }
    | ApiProblem;
export type FetchUpdatedEvaluationsApi = { data: Evaluation[]; kind: 'ok' } | ApiProblem;

// -----SUGGESTIONS-----

export type FetchUpdatedSuggestionsApi = { data: Suggestion[]; kind: 'ok' } | ApiProblem;
export type SyncSuggestionsOnServerApi =
    | { data: SyncResultWithRejections<Suggestion>; kind: 'ok' }
    | ApiProblem;
export type FetchExampleFlashcardsApi = { data: ExampleFlashcard[]; kind: 'ok' } | ApiProblem;

// -----TRANSLATIONS-----

export type TranslateRequest = {
    from: string;
    text: string;
    to: string;
};

export type TranslateResponse = {
    cacheHit: boolean;
    from: string;
    text: string;
    to: string;
    translation: string;
};

export type TranslateTextApi = { data: TranslateResponse; kind: 'ok' } | ApiProblem;

// -----BUNDLE MEMBERS-----

export type SyncBundleMembersOnServerApi =
    | { data: SyncResultWithRejections<BundleMember>; kind: 'ok' }
    | ApiProblem;
export type FetchUpdatedBundleMembersApi = { data: BundleMember[]; kind: 'ok' } | ApiProblem;

// -----WORDS BUNDLES-----

export type SyncWordsBundlesOnServerApi =
    | { data: SyncResultWithRejections<WordsBundle>; kind: 'ok' }
    | ApiProblem;
export type FetchUpdatedWordsBundlesApi = { data: WordsBundle[]; kind: 'ok' } | ApiProblem;
export type FetchWordsBundlesByIdsApi =
    | { data: WordsBundleWithOwnerInfo[]; kind: 'ok' }
    | ApiProblem;
export type GenerateBundleInvitationCodeApi = { data: BundleJoinCode; kind: 'ok' } | ApiProblem;
export type JoinBundleWithCodeApi =
    | { data: JoinBundleWithCodeResult; kind: 'ok' }
    | ApiProblem;
export type SearchWordsBundlesApi = { data: BundleSearchResponse; kind: 'ok' } | ApiProblem;
export type DeleteWordsBundleOnServerApi = { data: null; kind: 'ok' } | ApiProblem;
