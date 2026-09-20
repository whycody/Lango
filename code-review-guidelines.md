# Code Review Guidelines

Rules to apply during code review in this repo. Based on conventions actually present
in the code (mainly `src/screens/bundles/**` and `src/api/**` as the reference point for
the "new style"), not on generic best practices. This doesn't repeat what ESLint/Prettier
already enforce (import sorting, prop/key sorting, formatting) — see `eslint.config.js` /
`.prettierrc`.

## 0. JSX string props

- Plain string literal props: `titleTx="bundles.title"`, not `titleTx={'bundles.title'}`.
  Reserve `{}` for actual expressions/variables. ESLint doesn't have
  `react/jsx-curly-brace-presence` configured, so this isn't auto-fixed — worth catching
  by hand in review.

## 1. File naming

- **New files: kebab-case**, always (screens, components, hooks, sheets, api, types).
  Example: `use-bundle-query.ts`, `bundle-action-buttons.tsx`, `words-bundles-api.ts`.
- Old files in `src/ui/`, `src/store/`, `src/database/`, `src/navigation/` are PascalCase
  (`AuthContext.tsx`, `WordsBundleRepository.ts`) — **don't rename them** just because
  you're touching them for an unrelated change. This is an ongoing migration, not
  something to fix ad hoc in every PR.
- Flag in review: a new file added with PascalCase/camelCase instead of kebab-case.

## 2. Props and component types

- New components: **`interface XProps`**, not `type XProps = {...}`. This is the
  direction set by the "refactor components to use TypeScript interfaces and functional
  components" commit (4a1f4cb). `type` still exists in old code — no need to migrate it
  incidentally.
- Functional components only, typed as `FC<XProps>`. No classes exist and none should be
  added.
- List-item/leaf components rendered in lists (FlatList etc.) should be wrapped in
  `React.memo`, especially when they receive stable props from the parent — the pattern
  established in `SearchBundleListItem`.

## 3. App state

The split is intentional and should be maintained:

- **React Context** (`src/store/*Context.tsx` + `src/hooks/repo/*`) — for domain/offline-first
  state backed by SQLite (WatermelonDB-style repos in `src/database/`).
- **React Query** (`@tanstack/react-query`) — for remote, paginated, cacheable data
  (e.g. `use-bundle-query.ts`).
- Flag in review: a new API fetch done manually in `useEffect`/`useState` instead of via
  `useQuery`/`useMutation`; local/offline state kept outside Context without a reason.

## 4. API layer

A very consistent, mandatory pattern in `src/api/*-api.ts` — enforce it strictly:

- Every API method returns `{ data: T; kind: 'ok' } | { errorCode: ApiErrorCode; kind: 'error' }`.
  **Never throw exceptions from the API layer.**
- Error-to-code mapping is done by `resolveApiErrorCode()` (`src/utils/apiErrorUtils.ts`) —
  don't duplicate this logic inline in new methods.
- Map `ApiErrorCode` → user-facing text via a constant `Record<ApiErrorCode, TranslationKey>`
  (e.g. `BUNDLE_REMOVE_ERROR_MESSAGE_KEYS`), **never** via an inline `switch`/`if` in a
  component.
- Every new domain API module is an `XApi` class taking `api: Api` in its constructor,
  exported as a singleton (`export const xApi = new XApi(api)`), with routes as
  `const X_API_ROUTES = {...} as const`.
- Known debt: the identical `if (!response.ok || !response.data) return {...}` block is
  repeated in every API method. Doesn't need fixing in every PR, but don't multiply it
  further without reason — if you're adding >2 new methods in one file, consider a shared
  helper.

## 5. Localization (i18n)

- New components (especially shared/leaf ones) should accept `xxxTx?: TranslationKey`
  props and resolve them **inside** the component via `t()` — don't call `useTranslation()`
  in a leaf component just to pass an already-translated string down to a child.
  Pattern: `titleTx`, `descriptionTx`, `primaryActionLabelTx` in `GenericBottomSheet`.
- New translation keys: nested, `snake_case`, under the feature's namespace
  (`bundle_details.leaving.title`), not flat camelCase at the file root (old style).
- Flag in review: a new, reusable component accepting an already-resolved `string` to
  display instead of a translation key.

## 6. Theme colors type

- Type a `colors` param/prop as **`ThemeColors`** (`src/types/utils/theme-colors.ts`),
  not the indexed-access form `CustomTheme['colors']` inline. `ThemeColors` is just an
  alias for that same type, but using it keeps the type readable at call sites and
  matches the newer pattern (e.g. `search-bundle-list-item.tsx`).
- `CustomTheme` itself is still the right type for `useTheme() as CustomTheme`; only the
  colors-only case should use `ThemeColors`.
- Flag in review: a new `getStyles`/component prop typed as `CustomTheme['colors']`
  instead of importing `ThemeColors`.

## 7. Typing

- The project is **not** in TS `strict` mode, and ESLint has `no-explicit-any`,
  `explicit-function-return-type`, and `explicit-module-boundary-types` all turned off —
  meaning nothing automatically catches `any` or missing return types. This has to be
  enforced manually in review:
  - explicit return type on exported functions/hooks (see `useBundleQuery(...): UseQueryResult<...>`),
  - avoid `any`; if a type is genuinely unknown, use `unknown` + narrowing.
- Prefer discriminated unions to model results (`{data, kind:'ok'} | {errorCode, kind:'error'}`)
  over `null`/`undefined` plus a separate flag.

## 8. Constants / magic numbers

- No "bare" numbers/strings in JSX or logic (timing, heights, animation thresholds) —
  hoist them into the feature's `constants.ts`, as in `src/screens/bundles/details/constants.ts`.
  This is an actively enforced pattern (see refactor 22509e6, which replaced an inline
  `0.5` with `SEARCH_LIST_END_REACHED_THRESHOLD`).
- Flag in review: a new magic number pasted directly into a component instead of a named
  constant.
- Don't derive a spacing value by dividing/multiplying `MARGIN_HORIZONTAL`/`MARGIN_VERTICAL`
  (`src/constants/margins.ts`) when the result matches an existing `spacing` step — e.g.
  `MARGIN_VERTICAL / 2` (24 / 2 = 12) should just be `spacing.l`. Use the `spacing` scale
  directly whenever the value it needs already exists there; only fall back to
  `MARGIN_HORIZONTAL`/`MARGIN_VERTICAL` for the screen-edge margins they're meant for.
- Exception: don't force-extract a value that's only ever used once in a single file and
  is already self-explanatory next to its sibling values (e.g. `lineHeight: 22` sitting
  next to `fontSize: fontSize.l` in a text style). The rule targets values that are
  opaque out of context or reused across call sites (timing, thresholds, dimensions
  referenced from multiple places) — not every literal a component happens to contain.

## 9. Styles

- Standard: `StyleSheet.create` via a `getStyles(colors, ...)` function, memoized with
  `useMemo(() => getStyles(colors), [colors])`.
- Inline `style={{...}}` only when the value genuinely must be dynamic at render time
  (e.g. an `Animated.View` transform) — not for static values that belong in
  `StyleSheet`/`constants.ts`.
- Flag in review: an ad hoc style object built inline on every render without
  `useMemo`/`StyleSheet`.

## 10. Handler memoization (`useCallback`)

- **Don't reach for `useCallback` by default.** Only use it when there's a concrete reason:
  - the function is passed to a child wrapped in `React.memo` (e.g. list-row components
    like `BundleListItem`/`SearchBundleListItem` rendered via `FlatList`) — this actually
    prevents child re-renders;
  - the function is a dependency of another hook (`useEffect`, `useMemo`, another
    `useCallback`) and omitting the wrap would cause that hook to re-run unnecessarily.
- If neither applies, a plain arrow function/inline handler is preferable — it's simpler
  to read and has less overhead than an unnecessary `useCallback`.
- Reference example: `bundles-dashboard-screen.tsx` only wraps `handleBundlePress` and
  `handleBundlePlayPress` in `useCallback` — both passed to the `React.memo`'d
  `BundleListItem` via `FlatList` — and leaves every other handler as a plain function.
  That's the pattern to follow.
- Flag in review: a new `useCallback` added purely out of habit, wrapping a handler
  passed to a plain (non-memoized) component or used only inline in the same component's
  JSX.

## 11. Component/screen size

- Large "god screens" (e.g. `bundle-details-screen.tsx`, ~620 lines, ~20 inline handlers)
  are a signal to refactor, not an accepted pattern going forward.
- The established way to handle this in this repo: extract screen logic into dedicated
  `use-*` hooks in the feature's `hooks/` folder (see `useBundleLifecycleSheets`,
  `useBundleScrollAnimations`, `useBundleWordsData`, `useBundleInfo`). When adding more
  orchestration logic to an already-large screen, extract it into a hook instead of
  bolting on another inline handler.
- Prop-drilling via a manually assembled object (`{...bundleActionButtonsSharedProps}`)
  is acceptable for a narrow scope, but don't grow it further — if the shared prop list
  keeps expanding, consider Context or composition instead of a spread.

## 12. Tests

- The repo currently has **no automated tests** (no `*.test.ts(x)` files, no
  `jest.config.js`). Don't assume an existing testing convention in review — there isn't
  one.
- Don't block a PR for lacking tests until the team deliberately decides to change this.
  If you're adding non-trivial pure logic (e.g. in `utils/`), unit tests are welcome but
  not required today.

## 13. Commits

- Never add `Co-Authored-By: Claude`/AI attribution to commits in this repo.

---

*This file is meant to reflect the actual state of the code, not aspirations. When a
convention changes (e.g. `useCallback` gets unified, the kebab-case migration finishes),
update the relevant section instead of leaving a stale entry.*
